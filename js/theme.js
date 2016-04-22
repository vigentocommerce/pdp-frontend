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
	$('canvas').on('click',function(){
		$('body').find('.expanded').removeClass('expanded');
		/* Return unactivated status for .nav-toggle on topbar */
		$('.toolbar').find('.lnr-cross').removeClass('lnr-cross').addClass('lnr-menu');
	});
	/* Popup plugin content when click each plugin menu */
	$('[data-plugin]').each(function() {
		$(this).on('click',function(){
			var plugin_name = $(this).data("plugin");
			if($(this).hasClass('current')){ 
				/* Remove current status if it is */
				$('[data-plugin], [data-plugin-content]').removeClass('current');
				$(this).removeClass('current');
			}else{
				/* If not active then remove other tab, active it */
				$('[data-plugin], [data-plugin-content]').removeClass('current');
				$(this).addClass('current');
				$('[data-plugin-content='+plugin_name+']').addClass('current');
			}
			/* Remove all activated expanded div/dropdown */
			$('body').find('.expanded').removeClass('expanded');
			/* Return unactivated status for .nav-toggle on topbar */
			$('.toolbar').find('.lnr-cross').removeClass('lnr-cross').addClass('lnr-menu');
		});
	});
	/* UI Tab: User Upload Photo plugin */
	$('[data-plugin-content="upload"]').on('click','[data-upload]',function() {
			var plugin_name = $(this).data("upload");
			$('[data-upload], [data-upload-content]').removeClass('current');
			$(this).addClass('current');
			$('[data-upload-content='+plugin_name+']').addClass('current');
	});
	/* UI Tab: Image library  plugin*/
	$('[data-plugin-content="imagelibrary"]').on('click','[data-image]',function() {
			var plugin_name = $(this).data("image");
			$('[data-image], [data-image-content]').removeClass('current');
			$(this).addClass('current');
			$('[data-image-content='+plugin_name+']').addClass('current');
	});
	/* UI Tab: Text plugin */
	$('[data-plugin-content="text"]').on('click','[data-text]',function() {
			var plugin_name = $(this).data("text");
			$('[data-text], [data-text-content]').removeClass('current');
			$(this).addClass('current');
			$('[data-text-content='+plugin_name+']').addClass('current');
	});
	
	/* Click to close preview/current tab from toolbar bottom */
	$('[data-plugin-content]').on('click','.close',function() {
			//console.log($(this).parent());
			var plugin_name = $(this).data("close");
			console.log(plugin_name);
			$('[data-plugin='+plugin_name+'], [data-plugin-content='+plugin_name+']').removeClass('current');
	});
});