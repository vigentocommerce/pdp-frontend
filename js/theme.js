/* Javascript actions for frontend theme */
$(window).on('load',function(){
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
		$('[data-plugin], [data-plugin-content]').removeClass('current');
	});
	/* Hidden all expanded class by click on main view */
	$('canvas').on('click',function(){
		$('body').find('.expanded').removeClass('expanded');
		/* Return unactivated status for .nav-toggle on topbar */
		$('.toolbar').find('.lnr-cross').removeClass('lnr-cross').addClass('lnr-menu');
	});
	/* Tab chinh bao gom Your Items | Add Image | Add Text | Add Notes */
	$('[data-tab]').each(function(){
		$(this).on('click', function(){
			var tab_name = $(this).data('tab');
			$('[data-tab], [data-tab-content]').removeClass('active');
			$(this).addClass('active');
			$('[data-tab-content='+tab_name+']').addClass('active');
		});
	});
	$('.product').each(function(){
		/*  Moi tab co phan change du lieu khi click vao moi product item
			Moi selector "change" se co noi dung tuong ung trong "change-content"
		*/
		var $product = $(this);
		$(this).find('[data-change]').on('click',function(){
			var $selector = $(this).data('change');
			switch($selector){
				case 'product':	
				$('.selected-items').hide();
				$('[data-change-content="'+$selector+'"]').show();
				$('.close').on('click',function(){
					$('.selected-items').show();
					$('[data-change-content="'+$selector+'"]').hide();
				});
				break;
				case 'details':	
				$product.find('[data-change-content="'+$selector+'"]').toggle();
				break;
				
			}
		});
	});
	$('.add-more button').on('click', function(){
		$('.selected-items').hide();
		$('[data-change-content="product"]').show();
	});
	$('.product-list .close').on('click', function(){
		$('.selected-items').show();
		$('[data-change-content="product"]').hide();
	});
	$('.font-options .close').on('click', function(){
		$('.tab-content-text').show();
		$('.font-options').hide();
	});
	$('.curves-thumbnail').on('click',function(){
		$('.select-curves > li').each(function(){
			$(this).on('click',function(){
			var imgSrc = $(this).find('img').attr('src');
			$('.curves-thumbnail > a img').attr('src',imgSrc);
			console.log(imgSrc);
			});
		});
		$(this).find('.select-curves').toggle();
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
			$('[data-plugin='+plugin_name+'], [data-plugin-content='+plugin_name+']').removeClass('current');
	});
	/* Action on tab text */
	$('[data-text-field]').on('click',function(){
		
		var field = $(this).data('text-field');
		var $this = $(this);
		//console.log(field);
		switch(field){
			case 'object':
			$('[data-text-field="preview"] textarea').text($(this).val());
			$(this).keyup(function() {
				var style ='';
				$('[data-text-field="preview"] textarea').text($(this).val());
				//console.log($('[data-text-field="preview"]').val());
				
				
			});
			break;			
			case 'font':
			//Show font family list
			$('.tab-content-text').hide();
			$('.font-options').show();
			//$('.font-options').toggleClass('expanded');
			//Get font family
			$('.font-list li a').click(function(){
				$this.attr("style", $(this).attr("style"));
				$this.val($(this).text());
				$('.tab-content-text').show();
				$('.font-options').hide();
			});
			break;
			case 'curves':
			//Show curves text type list
			$('.tab-content-text').hide();
			$('.font-options').show();
			break;
			case 'size':
			//Valid size
			break;
		}
		
	});
	/* Color picker */
	$('[data-text-field="color"], [data-text-field="outlinecolor"]').spectrum({
		showPaletteOnly: true,
		showInput: true,
		showInitial: false,
		togglePaletteOnly: true,
		togglePaletteMoreText: 'More',
		togglePaletteLessText: 'Less',
		color: '#000',
		preferredFormat: "hex",
		palette: [["#000","#444","#666","#999","#ccc","#eee","#f3f3f3","#fff"],["#f00","#f90","#ff0","#0f0","#0ff","#00f","#90f","#f0f"],["#f4cccc","#fce5cd","#fff2cc","#d9ead3","#d0e0e3","#cfe2f3","#d9d2e9","#ead1dc"],["#ea9999","#f9cb9c","#ffe599","#b6d7a8","#a2c4c9","#9fc5e8","#b4a7d6","#d5a6bd"],["#e06666","#f6b26b","#ffd966","#93c47d","#76a5af","#6fa8dc","#8e7cc3","#c27ba0"],["#c00","#e69138","#f1c232","#6aa84f","#45818e","#3d85c6","#674ea7","#a64d79"],["#900","#b45f06","#bf9000","#38761d","#134f5c","#0b5394","#351c75","#741b47"],["#600","#783f04","#7f6000","#274e13","#0c343d","#073763","#20124d","#4c1130"]],
		move: function (color) {
			updateInput(color);
		},
		change: function (color){
			updateInput(color);
		}
	});
	/* Update color input value from color picker */
	function updateInput(color) {
		var hexColor = "transparent";
		if(color) {
			hexColor = color.toHexString();
		}
		$('[data-text-field="color"]').val(hexColor);
		$('[data-text-field="outlinecolor"]').val(hexColor);
	}
	
});