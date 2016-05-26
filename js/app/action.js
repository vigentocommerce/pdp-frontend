define(['jquery', 'fabricjs', 'pdp'], function($, fabricjs, pdp) {
    var mainContent = '.mainContent',
        pdpObject = pdp();
    /** Current Canvas=> canvas = pdpObject.getCurrentCanvas(); */
    /******************** Most of PDP events here ***********************/
	/** Switch Side */
	// $(mainContent).on('click', '[pdc-action="SWITCH_SIDE"]', function() {
    //     if($(this).hasClass('current')) {
    //         return false;
    //     }
    //     $('[pdc-action="SWITCH_SIDE"]').removeClass('current');
	// 	$(this).addClass('current');
    //     //Do switch side here
	// 	var sideId = $(this).find('.side-item').attr('id').replace('side-', '');
    //     $.each(pdpObject.allCanvas, function(i, _canvas) {
    //         _canvas.deactivateAll();
    //         _canvas.renderAll();
    //     });
    //     $('[data-popup-content="sideswap"]').removeClass('active');
    //     $('[data-popup="sideswap"]').removeClass('active');
    //     pdpObject.initCanvas();
	// });
});