<?php

require_once __DIR__.'/config.php';
require_once 'mvid/mvid-handler.php';
$mv_session_id = $$mvid_storage_name;

function json_encode_num($v) {
	return json_encode($v, JSON_NUMERIC_CHECK | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
}

function comma_check_access($mv_session_id, $mvid_shared_key) {
	if (empty($mv_session_id)) {
		return false;
	}

	if (!empty($_COOKIE['comma-hmac'])) {
		$data = json_decode($_COOKIE['comma-hmac'], true);
		if (!empty($data['s']) && !empty($data['h']) && $data['s'] >= time()) {
			$hmac = hash_hmac('sha256', "{$data['s']}-{$mv_session_id}", $mvid_shared_key);
			if ($hmac === $data['h']) {
				return true;
			}
		}
	}

	$client = new JsonWspClient('https://mvid-services.mv-nordic.com/v2/UserService/jsonwsp/description');
	$client->setViaProxy(true);

	foreach ($GLOBALS['-config']['MVID_ACCESS_IDS'] as $mv_ai) {
		$args = [];
		$args['session_id'] = $mv_session_id;
		$args['access_identifier'] = $mv_ai;
		$response = $client->CallMethod('hasPermission', $args);

		if ($response->getJsonWspType() == JsonWspType::Response && $response->getCallResult() == JsonWspCallResult::Success) {
			$responseJson = $response->getJsonResponse();
			$result = $responseJson['result'];
			if (!empty($result['has_permission'])) {
				$data = ['s' => time() + 11*60];
				$data['h'] = hash_hmac('sha256', "{$data['s']}-{$mv_session_id}", $mvid_shared_key);
				setcookie('comma-hmac', json_encode($data, JSON_NUMERIC_CHECK|JSON_UNESCAPED_UNICODE), time() + 10*60);
				return true;
			}
		}
		else if($response->getJsonWspType() == JsonWspType::Fault) {
			//echo 'Service fault: '.$response->getServiceFault()->getString();
			return false;
		}
	}
	return false;
}
