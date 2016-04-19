/* Javascript actions for frontend theme */
jQuery(document).ready(function($) {
	/* Top help dropdown */
	 $('.toppage').on("click", ".help", function(){ 
        $('.tooltip-outline').toggle();
    });
	/* Side Switcher */
	$('.toolbar').on("click",".side-down",function(){
		$('.side-switcher ul').toggleClass('expanded');
		$(this).toggleClass('small');
	});
	/* Toggle Main actions dropdown */
	$('.toolbar').on("click",".action-down",function(){
		$('.main-actions ul').toggleClass('expanded');
	});
	
});