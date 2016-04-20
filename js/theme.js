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
		/* Return unactivated status for .nav-toggle on topbar */
		$('.toolbar').find('.lnr-cross').removeClass('lnr-cross').addClass('lnr-menu');
	});
	/* Popup plugin content when click each plugin menu */
	$('[data-plugin]').each(function() {
		$(this).on('click',function(){
			var plugin_name = $(this).data("plugin");
			$('[data-plugin], [data-plugin-content]').removeClass('current');
			$(this).addClass('current');
			$('[data-plugin-content='+plugin_name+']').addClass('current');
		});
	  
	});
});