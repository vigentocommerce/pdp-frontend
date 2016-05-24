<?php 
/**
* @package    Magebay_PDP 2016
* @version    2.0
* @author     Magebay Developer Team <magebay99@gmail.com>
* @website    http://www.productsdesignercanvas.com
* @copyright  Copyright (c) 2009-2016 MAGEBAY.COM. (http://www.magebay.com)
*/
class PDPServer {
    public function getProductConfig($productId) {
        $pdpItemId = 1;
        $pdp_product_type_colors_sides = array(
            array('id' => '1','canvas_width' => '400','canvas_height' => '400','canvas_top' => '150','canvas_left' => '150','side_id' => '1','color_id' => '1','background_image' => 'data/pdp/image/colorSides/background/1463974755_colorimage71452755103.png','side_name' => 'Front Side','color_name' => 'Green','color_code' => '3ca647'),
            array('id' => '2','canvas_width' => '400','canvas_height' => '400','canvas_top' => '150','canvas_left' => '150','side_id' => '2','color_id' => '1','background_image' => 'data/pdp/image/colorSides/background/1463974755_colorimage81452755103.png','side_name' => 'Back Side','color_name' => 'Green','color_code' => '3ca647'),
            array('id' => '3','canvas_width' => '400','canvas_height' => '400','canvas_top' => '100','canvas_left' => '200','side_id' => '1','color_id' => '2','background_image' => 'data/pdp/image/colorSides/background/1463977998_colorimage71452678632.png','side_name' => 'Front Side','color_name' => 'Black','color_code' => '141014'),
            array('id' => '4','canvas_width' => '400','canvas_height' => '400','canvas_top' => '100','canvas_left' => '200','side_id' => '2','color_id' => '2','background_image' => 'data/pdp/image/colorSides/background/1463977998_colorimage81452678632.png','side_name' => 'Back Side','color_name' => 'Black','color_code' => '141014')
        );
        //echo "<pre>";
        //print_r($pdp_product_type_colors_sides);
        foreach($pdp_product_type_colors_sides as $colorSideItem) {
            $config[$pdpItemId]['colors'][$colorSideItem['color_id']][$colorSideItem['side_id']] = $colorSideItem;
        }
        //print_r($config);
        return $config[$productId];
    }
    public function getConfig() {
        
    }
}
$request = $_REQUEST;
if (isset($request['action'])) {
    $action = $request['action'];
    switch ($request['action']) {
    case 'getProductConfig':
            $pdpObject = new PDPServer();
            $config = $pdpObject->getProductConfig($request['id']);
            $response = array(
                'status' => 'success',
                'message' => 'Get product config successfully!',
                'data' => $config
            );
            echo json_encode($response);
            break;
        default:
            echo "Your Action is: " . $action;
            break;
    }    
}
