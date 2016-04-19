/* Javascript actions for frontend theme */
jQuery(document).ready(function($) {
	/* Top help dropdown */
	 $('.toppage').on("click", ".help", function(){ 
        $('.tooltip-outline').toggleClass('expanded');
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
	/* Toggle Block left */
	$('.toolbar').on("click",".nav-toggle",function(){
		$(".lnr-menu, .lnr-cross").toggleClass("lnr-menu lnr-cross"); 
		$('.block-sidebar-left').toggleClass('expanded');
	});
	/* Hidden all expanded class by click on main view */
	$('.main-view').on('click',function(){
		$('body').find('.expanded').removeClass('expanded');
		
	});
});