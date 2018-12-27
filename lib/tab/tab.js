// function textTrim(txt) {  
//         	return txt.replace(/(^\s*)|(\s*$)/g,"");  
//     	}

$(function(){
    //左侧选项卡切换
    $('#section').find('.sec_left ul li h2').click(function(event) {
        var switchs = false ;
        if ($(this).siblings().css('display') == 'block') {
            switchs = false; 
        }else{
            switchs = true;
        };
        $('#section').find('.sec_left ul li h2').siblings().css('display','none');
        if (switchs) {
            $(this).siblings().css('display','block');
        }else{
            $(this).siblings().css('display','none');
        };
    });
    //左侧列表点击切换
    $('#section').find('.sec_left ul li dl dd').each(function(index, el) {
        $(this).click(function(event) {
            $('#section').find('.sec_left ul li dl dd').removeClass('active');
            $(this).addClass('active');
            //更换右侧显示内容
            $('#section').find('.sec_right .content .list li').css({
                'display': 'none'
            });
            $('#section').find('.sec_right .content .list li').eq(index).css({
                'display': 'block'
            });
            
            var param1=$(this).parent().siblings(".type").children().text();
            
            var param=param1+','+$(this).text();
         });
    });
    //左侧列表hover效果
    $('#section').find('.sec_left ul li dl dd').hover(function() {
        $(this).css({
            'color': '#aac5ea',
            'background':'#f2f1f0'
        });
    }, function() {
        $(this).css({
            'color': '#646464',
            'background':'#e6e6e6'
        });
    });
})