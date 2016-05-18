<?php 
/**
* @package    Magebay_PDP 2016
* @version    2.0
* @author     Magebay Developer Team <magebay99@gmail.com>
* @website    http://www.productsdesignercanvas.com
* @copyright  Copyright (c) 2009-2016 MAGEBAY.COM. (http://www.magebay.com)
*/
class PDPServer {
    public function getSideConfig() {
        $config = array(
            'side1' => 'Side 1'
        );
        return $config;
    }
}
$request = $_REQUEST;
if (isset($request['action'])) {
    $action = $request['action'];
    switch ($request['action']) {
    case 'side-config':
            echo "<pre>";
            $pdpObject = new PDPServer();
            $config = $pdpObject->getSideConfig();
            var_dump($config);
            break;
        default:
            echo "Your Action is: " . $action;
            break;
    }    
}
