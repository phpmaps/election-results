<?php
define("LOG_TO_FILE", 0);
define("LOG_TO_CLIENT", 1);
define("LOG_TO_CLIENT_AND_FILE", 2);

/**
 * The ProxClasses file contains three simple classes 1) RestRequest 2) ProxyLog 3) RestRequest 
 */

/**
 * 
 * Proxy is designed to take in request from client and handle it according to the configuration options 
 * found in the proxy.php file
 *
 * PHP version 5.3.6
 */

class Proxy {

	public $_files = array ();
	public $_post = array ();
	public $_get = array ();
	public $_allowedMimeTypes = array();
	public $_queryString;
	public $_tempPath;
	public $_allowedDomains = array();
	public $_requireMatch = true;
	public $_defaultUrl;
	public $_useGet;
	public $_errorReporting;
	public $_logPath;
	public $_logErrors;
	public $_logLevel;
	public $log;
	
	public function __construct(array $options = null) {
	    if (is_array($options)) {
            $this->setOptions($options);
        }
		$this->postConstruct();
		$this->initLogging();
	}
	
	public function __set($name, $value)
    {
        $method = 'set' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Invalid proxy property. (line 50)');
        }
        $this->$method($value);
    }
 
    public function __get($name)
    {
        $method = 'get' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Invalid proxy property. (line 59)');
        }
        return $this->$method();
    }
	
	public function getQueryString() {
		return $this->_queryString;
	}
	
	public function setQueryString($queryString) {
		$this->_queryString = $queryString;
		
		return $this;
	}
	
	public function getAllowedDomains() {
		return $this->_allowedDomains;
	}
	
	public function setAllowedDomains($allowedDomains) {
		$this->_allowedDomains = $allowedDomains;
		
		return $this;
	}
	
	public function getAllowedMimeTypes() {
		return $this->_allowedMimeTypes;
	}
	
	public function setAllowedMimeTypes($allowedMimeTypes) {
		$this->_allowedMimeTypes = $allowedMimeTypes;
		return $this;
	}
	
	public function getUseGet() {
		return $this->_useGet;
	}
	
	public function setUseGet($useGet) {
		$this->_useGet = $useGet;
		return $this;
	}
	
	public function getErrorReporting() {
		return $this->_errorReporting;
	}
	
	public function setErrorReporting() {
		$this->_errorReporting = $errorReporting;
		return $this;
	}
	
	public function getLogErrors() {
		return $this->_logErrors;
	}
	
	public function setLogErrors($logErrors) {
		$this->_logErrors = $logErrors;
		return $this;
	}
	
	public function getLogLevel() {
		return $this->_logLevel;
	}
	
	public function setLogLevel($logLevel) {
		$this->_logLevel = $logLevel;
		return $this;
	}
	
	public function getLogPath() {
		return $this->_logPath;
	}
	
	public function setLogPath($logPath) {
		$this->_logPath = $logPath;
		return $this;
	}
	
	public function getDefaultUrl() {
		return $this->_defaultUrl;
	}
	
	public function setDefaultUrl($defaultUrl) {
		$this->_defaultUrl = $defaultUrl;
		return $this;
	}
	
	public function getTempPath() {
		return $this->_tempPath;
	}
	
	public function setTempPath($tempPath) {
		$this->_tempPath = $tempPath;
		return $this;
	}
	
	public function getRequireMatch() {
		return $this->_requireMatch;
	}
	
	public function setRequireMatch($requireMatch) {
		$this->_requireMatch = $requireMatch;
		return $this;
	}
	
	public function getGet() {
		return $this->_get;
	}
	
	public function setGet($get) {
		$this->_get = $get;
		return $this;
	}
	
	public function getFiles() {
		return $this->_files;
	}
	
	public function setFiles($files) {
		$this->_files = $files;
		return $this;
	}
	
	public function getPost() {
		return $this->_post;
	}
	
	public function setPost($post) {
		$this->_post = $post;
		return $this;
	}
	
    public function setOptions(array $options)
    {
        $methods = get_class_methods($this);
        foreach ($options as $key => $value) {
			if ($key == "errorReporting") {
				$this->setOptions($value);
				continue;
			}
            $method = 'set' . ucfirst($key);
            if (in_array($method, $methods)) {
                $this->$method($value);
            }
        }
        return $this;
    }
	
	public function postConstruct() {
		if(!isset($this->_allowedDomains) || empty($this->_allowedDomains)){
			$this->_allowedDomains = array("url" => $this->_defaultUrl, "mustMatch" => true, "token" =>"");
		}else{
			array_push($this->_allowedDomains, array("url" => $this->_defaultUrl, "mustMatch" => true, "token" =>""));
		}
		if(!isset($this->_queryString) || empty($this->_queryString)){
			$this->setQueryString($this->_defaultUrl);
		}
	}
	
	public function initLogging() {
		$this->log = new ProxyLog($this->_logPath, $this->_logLevel);
	}
	
	/**
	 * Delegate method will POST values or files to a specified server and returns the server's response.
	 * To call this method, ProxyPost::_queryString must be set with a URL as string which supports Esri Web API proxy pattern.
	 * Delegate retuns an associative array. Potential keys within this array are: status, type, response.	 
	 *
	 * @var bool
	 * @return <array>
	 */
	public function delegate() {
		if ($this->_requireMatch) {
			$pos = $this->is_url_allowed ();
		}
		if (isset ( $this->_files ) && ! empty ( $this->_files )) {
			$upload_path = $this->getTempPath ();
			foreach ( $this->_files as $key => $value ) {
				if ($value ["error"] == UPLOAD_ERR_OK) {
					$file = $upload_path . $value ["name"];
					move_uploaded_file ( $value ["tmp_name"], $file );
					$t ['file'] = '@' . $upload_path . $value ["name"];
					$t = array_merge ( $t, $this->_post );
					$restRequest = new RestRequest ( array ("url" => $this->_queryString, "method" => 'FILE', "requestBody" => null, "file" => $t, "log" => $this->log));
					$restRequest->executeFile ();
					unlink($file);
				} else {
					$this->log->report("Unknown error happened when moving file.");
				}
			}
		} else {
			if($this->_useGet) {
				$parts = preg_split("/\?/", $this->_queryString);
				if (count($parts) <= 1) {
					$needle = '&'; // http://en.wikipedia.org/wiki/Percent-encoding (observed PHP does odd things with & character)
					$haystack = $parts[0];
					$pos = strpos($haystack,$needle);
					if($pos >= 1) {
						$this->log->report("URL contains no question mark and contains invalid character.");
					}
				}
				$restRequest = new RestRequest ( array ("url" => $this->_queryString, "method" => 'GET', "requestBody" => null, "log" => $this->log ));
				$restRequest->execute ();
			}else{
				$restRequest = new RestRequest ( array ("url" => $this->_queryString, "method" => 'POST', "requestBody" => $this->getPost (), "log" => $this->log));
				$restRequest->execute ();
			}
		}
		return $this->executeComplete ( $restRequest );
	}
	
	public function is_url_allowed() {
		$pos = false;
		$parts = preg_split("/\?/", $this->_queryString);
		$requestedUrl = $parts[0];
		
		for($i = 0, $len = count ( $this->_allowedDomains ); $i < $len; $i ++) {
			$value = $this->_allowedDomains [$i];
			$allowedDomain = $value['url'];
			
			if ($value ['mustMatch']) {			
				if (stripos ( $requestedUrl, $allowedDomain ) === 0) {
					$pos = $i;
					break;
				}
				if ((strcasecmp ( $requestedUrl, $allowedDomain ) == 0)) {
					$pos = $i;
					break;
				}
			} else {
				//mustMatch is false
				$pos = $i;
			}
		}
		if ($pos === false) {
			header ( 'Status: 403', true, 403 );
			$this->log->report("Target URL is not allowed!");
		} else {
			$token = $this->_allowedDomains [$pos] ['token'];
			if ($token) {
				$this->_queryString .= (stripos ( $this->_queryString, "?" ) !== false ? '&' : '?') . 'token=' . $token;
			}
		}
		return $pos;
	}
	
	public function executeComplete($restRequest) {
		$responseInfo = $restRequest->getResponseInfo ();
		return array ("status" => $responseInfo ['http_code'], "type" => $responseInfo ['content_type'], "response" => $restRequest->getResponseBody () );
	}
}

/**
 * RestRequest class handles all communication to REST Services
 *
 * PHP version 5.3.6

 * @category   Logging
 * @package    ProxyLog
 * @version    v10 $Revision: 05-20-12 19:27:56 A $
 * @link       http://www.esri.com
 * @see        proxy.php (example usage)
 * @since      05-20-12 19:27:56
 * @deprecated File deprecated in Release v10.1
 */

class ProxyLog
{
    public $_timeFormat = 'm-d-y H:i:s - ';
    public $_eol = "\r\n";
    public $_indent = " ";
	public $_logPath;
	public $_logLevel;
	
	public function __construct($logPath = null, $logLevel = null) 
	{
		$this->_logPath = $logPath;
		$this->_logLevel = $logLevel;
	}
	
	public function getTime()
	{
		return date($this->_timeFormat);   
	}
	
	public function fileLog($error_message)
	{
		if(isset($this->_logPath)) {
			try {
				$fh = null;
				if (file_exists($this->_logPath)) {
					if (is_writable($this->_logPath)) {
						$fh = fopen($this->_logPath, 'a');
						fwrite($fh, $this->_eol);
						fwrite($fh, $this->getTime());
						fwrite($fh, $this->_indent);
						fwrite($fh, $error_message);
					}
				} else {
					$fh = fopen($this->_logPath, 'w');
					fwrite($fh, $this->getTime());
					fwrite($fh, $this->_indent);
					fwrite($fh, "Proxy log created.");
					fwrite($fh, $this->_eol);
					fwrite($fh, $this->getTime());
					fwrite($fh, $this->_indent);
					fwrite($fh, $error_message);
				}
				fclose($fh);
			} catch (Exception $e) {
				throw new Exception('Logging error occured. (line 375)');
			}
		}else{
			if($this->_logLevel == 1 || $this->_logLevel == 2) {
				throw new Exception('Logging error occured. ' . $error_message . ' (line 379)');
			}
		}
	}
	
	public function clientLog($error_message) 
	{
		exit($error_message);
	}
	
	public function report($error_message)
	{
		if ($this->_logLevel == 0) {
			$this->fileLog($error_message);
		} elseif ($this->_logLevel == 1) {
			$this->clientLog($error_message);
		} elseif ($this->_logLevel == 2) {
			$this->fileLog($error_message);
			$this->clientLog($error_message);
		}
	}
}

/**
 * RestRequest class handles all communication to REST Services
 *
 * PHP version 5.3.6

 * @category   Communication
 * @package    RestRequest
 * @version    v10 $Revision: 05-20-12 19:27:56 A $
 * @link       http://www.esri.com
 * @see        proxy.php (example usage)
 * @since      05-20-12 19:27:56
 * @deprecated File deprecated in Release v10.1
 */

class RestRequest {

	public $_url;
	public $_method;
	public $_requestBody;
	public $_file;
	public $_requestLength;
	public $_responseBody;
	public $_responseInfo;
	public $log;
	
	public function __construct(array $options = null) {
		if (is_array($options)) {
            $this->setOptions($options);
        }
		if ($this->_requestBody !== null) {
			$this->buildPostBody ();
		}
	}
	
	public function __set($name, $value)
    {
        $method = 'set' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Error occured before logging was enabled. (line 440)');
        }
        $this->$method($value);
    }
 
    public function __get($name)
    {
        $method = 'get' . $name;
        if (('mapper' == $name) || !method_exists($this, $method)) {
            throw new Exception('Error occured before logging was enabled. (line 449)');
        }
        return $this->$method();
    }
	
	public function getRequestBody() {
		return $this->_requestBody;
	}
	
	public function setRequestBody($requestBody) {
		$this->_requestBody = $requestBody;
		return $this;
	}
	
	public function getLog() {
		return $this->log;
	}
	
	public function setLog($log) {
		$this->log = $log;
		return $this;
	}
	
	public function getResponseBody() {
		return $this->_responseBody;
	}
	
	public function setResponseBody($responseBody) {
		$this->_responseBody = $responseBody;
		return $this;
	}
	
	public function getResponseInfo() {
		return $this->_responseInfo;
	}
	
	public function setResponseInfo($responseInfo) {
		$this->_responseInfo = $responseInfo;
		return $this;
	}
	
	public function getUrl() {
		return $this->_url;
	}
	
	public function setUrl($url) {
		$this->_url = $url;
		return $this;
	}
	
	public function getMethod() {
		return $this->_method;
	}
	
	public function setMethod($method) {
		$this->_method = $method;
		return $this;
	}
	
	public function getFile() {
		return $this->_file;
	}
	
	public function setFile($file) {
		$this->_file = $file;
		return $this;
	}
	
	public function getRequestLength() {
		return $this->_requestLength;
	}
	
	public function setRequestLength($requestLength) {
		$this->_requestLength = $requestLength;
		return $this;
	}
	
	public function setOptions(array $options)
    {
        $methods = get_class_methods($this);
        foreach ($options as $key => $value) {
            $method = 'set' . ucfirst($key);
            if (in_array($method, $methods)) {
                $this->$method($value);
            }
        }
        return $this;
    }

	public function buildPostBody($data = null) {
		$data = ($data !== null) ? $data : $this->_requestBody;
		
		if (! is_array ( $data )) {
			$this->log->report("Invalid data input recieved.");
		}
		
		$data = http_build_query ( $data, '', '&' );
		
		$this->_requestBody = $data;
	}
	
	public function execute() {
		$curl = curl_init ();
		
		try {
			switch (strtoupper ( $this->_method )) {
				case 'GET' :
					$this->executeGet ( $curl );
					break;
				case 'FILE' :
					$this->executeFile ( $curl );
					break;
				case 'POST' :
					$this->executePost ( $curl );
					break;
				case 'PUT' :
					$this->executePut ( $curl );
					break;
				case 'DELETE' :
					$this->executeDelete ( $curl );
					break;
				default :
					$this->log->report('Current method (' . $this->_method . ') is an invalid REST method.');
			}
		} catch ( InvalidArgumentException $e ) {
			curl_close ( $curl );
			$this->log->report($e);
		} catch ( Exception $e ) {
			curl_close ( $curl );
			$this->log->report($e);
		}
	}
	
	protected function setCurlOpts(&$curl) {
		curl_setopt ( $curl, CURLOPT_SSL_VERIFYPEER, false ); // Weak setting not designed for production.  http://unitstep.net/blog/2009/05/05/using-curl-in-php-to-access-https-ssltls-protected-sites/
		curl_setopt ( $curl, CURLOPT_URL, $this->_url );
		curl_setopt ( $curl, CURLOPT_RETURNTRANSFER, true );
		curl_setopt ( $curl, CURLOPT_FOLLOWLOCATION, 1 );
	}
	
	protected function doExecute(&$curl) {
		$this->setCurlOpts ( $curl );
		$this->_responseBody = curl_exec ( $curl );
		$this->_responseInfo = curl_getinfo ( $curl );
		curl_close ( $curl );
	}
	
	public function executeFile() {
		$curl = curl_init ();
		curl_setopt ( $curl, CURLOPT_POST, 1 );
		curl_setopt ( $curl, CURLOPT_POSTFIELDS, $this->_file );
		$this->doExecute ( $curl );
	}
	
	protected function executePost($curl) {
		if (! is_string ( $this->_requestBody )) {
			$this->buildPostBody ();
		}
		curl_setopt ( $curl, CURLOPT_POST, 1 );
		curl_setopt ( $curl, CURLOPT_POSTFIELDS, $this->_requestBody );
		$this->doExecute ( $curl );
	}
	
	protected function executePut($curl) {
		if (! is_string ( $this->_requestBody )) {
			$this->buildPostBody ();
		}
		
		$this->_requestLength = strlen ( $this->_requestBody );
		
		$fh = fopen ( 'php://memory', 'rw' );
		fwrite ( $fh, $this->_requestBody );
		rewind ( $fh );
		
		curl_setopt ( $curl, CURLOPT_INFILE, $fh );
		curl_setopt ( $curl, CURLOPT_INFILESIZE, $this->_requestLength );
		curl_setopt ( $curl, CURLOPT_PUT, true );
		
		$this->doExecute ( $curl );
		
		fclose ( $fh );
	}
	
	protected function executeDelete($curl) {
		curl_setopt ( $curl, CURLOPT_CUSTOMREQUEST, 'DELETE' );
		$this->doExecute ( $curl );
	}
	
	protected function executeGet($curl) {
		$this->doExecute ( $curl );
	}
}