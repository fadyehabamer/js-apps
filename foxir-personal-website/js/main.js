
/* start  typer.js  */ 
var options = {
    strings: ["Designer", "developer"],
    typeSpeed: 80,
    fadeOut: true,
    loop: true,
    showCursor: true
};
var typed = new Typed('.element', options);
/* end typer.js  */ 
  


  /* jQuery counterUp   */ 
  $('[data-toggle="counter-up"]').counterUp({
    delay: 10,
    time: 1000
  });



 // Portfolio isotope filter
 $(document).ready(function(){
    $('.portfolio-item').isotope(function(){
        itemSelector:'.item'
      });
  
  
  
    $('.portfolio-menu ul li').click(function(){
      $('.portfolio-menu ul li').removeClass('active');
      $(this).addClass('active');
  
  
      var selector = $(this).attr('data-filter');
        $('.portfolio-item').isotope({
          filter: selector
        })
        return false;
    });
  });


//change color

$(document).ready(function(){
  $(window).scroll(function(){
  	var scroll = $(window).scrollTop();
	  if (scroll > 300) {
	    $(".navbar").css("background" , "blue");
	  }

	  else{
		  $(".navbar").css("background" , "#333");  	
	  }
  })
})
  