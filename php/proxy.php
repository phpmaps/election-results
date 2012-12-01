<?php
/**
 * PHP Proxy Page:: A PHP proxy designed to support ArcGIS Web APIs.  Requires Proxy Class, RestRequest Class 
 * and Log Class.  These classes are located in the ProxySupportClasses.php file.  The ProxySupportClasses.php file needs to live 
 * in the same directory as this proxy.php file.
 *
 * @category   Proxy ArcGIS Web APIs
 * @package    Proxy
 * @link       http://www.esri.com
 * @see        proxy.php (example usage)
 * @since      05-31-12 21:06:49
 * @deprecated 09-30-12 21:06:49
 *
 * HOW IT WORKS
 * [1] Edit the temp path to support file attachments. Once files are uploaded, they are removed.
 *        ex. $tempPath = "C:/upload/"; (Windows)   ex. $tempPath = "/usr/local/uploads"; (Linux)
 *
 * [2] Edit the default URL to aid in debugging.  To confirm proxy page is working type http://<myserver>/proxy.php.  This will bring up the default URL.
 *		  ex. $defaultUrl = "http://www.esri.com";
 *
 * [3] The property "requireMatch" needs to be set.
 *     false: proxy will attempt to work with any URL on the web.
 *     true: proxy will only work with URLs found in the allowedUrls array.
 *		  ex. $requireMatch = true;
 *
 *[4] Edit the allowedUrls array  
 *        ex. $allowedUrls = array(array("url" => "<arcgis-service-url>", "mustMatch" => true, "token" => "abcdefghijklmnop"));
 *          -url: the arcgis service url
 *          -mustMatch: true: Url in allowedUrls must match exactly,  false: does not have to match exactly
 *          -token: the arcgis token if the service has been secured (it's best pratice to secure the proxy page when setting this property)
 *
 *[5] Logging options must be set
 *		  ex. "errorReporting" => array("logErrors" = true, "logLevel" = LOG_TO_CLIENT_AND_FILE, "logPath" = $logPath);
 *		    -logError: false- only stanard PHP errors will be recorded, true- application will log errors according to log level
 *			-logLevel: LOG_TO_FILE | LOG_TO_CLIENT | LOG_TO_CLIENT_AND_FILE
 *			-logPath: directory path to file which stores log messages  ex. $logPath = "C:/log/proxy_error.log";
 *
 *[6] Set the "useGet" property. 
 *		ex. true: GET http protocol will be used
 *		ex. false: POST http protocol will be used (default)
 *
 * REQUIREMENTS
 *  - cURL extension for PHP must be installed and loaded. To load it, 
 *    add the following lines to your php.ini file:
 *     extension_dir = "<your-php-install-location>/ext"
 *     extension = php_curl.dll
 *     
 *  - Turn OFF magic quotes for incoming GET/POST data: add/modify the
 *    following line to your php.ini file:
 *     magic_quotes_gpc = Off 
 * 
 * NOTES
 *	- More work can be done to support SSL.  See RestRequest::setCurlOpts() for current SSL support.
 *
**/ 
include 'ProxyClasses.php';

/****DESIGNED TO BE EDITING***/

$tempPath = "C:/upload/";
$defaultUrl = "http://www.esri.com";
$logErrors = true;
$logLevel = LOG_TO_CLIENT;
$logPath = "C:/log/proxy_error.log";
$useGet = false;
$requireMatch = false;
$allowedUrls = array (
	array ('url' => 'http://localhost:6080/arcgis/admin/', 'mustMatch' => true, 'token' => '' ), 
	array ('url' => 'https://servicesbeta4.esri.com/ArcGIS/rest/services/', 'mustMatch' => true, 'token' => '' ), 
	array ('url' => 'https://servicesbeta.esri.com/ArcGIS/rest/services/', 'mustMatch' => true, 'token' => 'zc293nwzQOci2HgGB06cuuOXsHoeZB5iRGzfL7X-3bI.' ),
	array ('url' => 'http://www.github.com', 'mustMatch' => true, 'token' => '' )
);


$proxyOptions = array ("queryString" => $_SERVER['QUERY_STRING'], "post" => $_POST, "files" => $_FILES, "get" => $_GET, "tempPath" => $tempPath, "errorReporting" => array("logErrors" => true, "logLevel" => $logLevel, "logPath" => $logPath), "allowedUrls" => $allowedUrls, "requireMatch" => $requireMatch, "defaultUrl" => $defaultUrl, "useGet" => $useGet);
$proxy = new Proxy($proxyOptions);
$response = $proxy-> delegate();
header("Status: " . $response['status']);
header("Content-Type: " . $response['type']); 
echo $response["response"];
?>