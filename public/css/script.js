var userbmi =  Number($(".bmival").text());
if(userbmi < 18.5){
    $("#bmitype").text("Under weight");
    $("#bmitype").css("color", "yellow");
}
else if( userbmi < 24.9){
    $("#bmitype").text("Heathy");
    $("#bmitype").css("color", "green");
}
else if( userbmi < 29.9){
    $("#bmitype").text("Over weight");
    $("#bmitype").css("color", "orange");
}
else{
    $("#bmitype").text("Obese");
    $("#bmitype").css("color", "red");
}

// $("#bmitype").text("Under weight");
//  $("#bmitype").css("text-color", "blue");

var height =  Number($("#height").text());
var weight =  Number($("#weight").text());
var age =  Number($("#age").text());
var sex =  $(".sex").text();
var bmr;
if( sex == "Female"){
    bmr = Number(655 + (4.35 * weight * 2.20462) + (4.7 * height * 39.3701) - (4.7 * age));
}
else{
    bmr = Number(66 + (6.23 * weight * 2.20462) + (12.7 * height * 39.3701) - (6.8 * age)); //Male
}

$(".bmr").text( bmr);
$(".idealCal").text( bmr * 1.375);