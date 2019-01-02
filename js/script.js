/**
 * 地图事件
 * 基于openlayers的地图事件
 */

function userManage(target){
    this.serverIP = "http://192.168.0.172:12600/tricyclicGIS";
    // this.serverIP = "http://192.168.0.128:8080/tricyclicGIS";

    this.userId = "1";
    var that = this;

    $.ajax({
        url:this.serverIP+'/listCustomMap',
        methodL:"GET",
        data:{"userId":that.userId},
        success:function(data){
            var newData = [{type:'self',data:data.data}];
            that.init_(target,newData);
        },
        error:function(error){
            console.log(error);
            that.init_(target,'');
            that.tips("服务器连接出错，请稍后重试",20000);
        }
    })

    this.initPageAction();
    this.initPageAction_tree();

}

// userManage.varructor = userManage;
// userManage.prototype = Map;
// console.log(userManage.varructor);
userManage.prototype = {
    /**
     * 页面初始化
     * @param {string,object} target 地图容器id  dataSource 服务器端请求的数据
    */
    init_: function(target,dataSource){

    },
    initPageAction: function(){
      var that = this;

      // 左侧功能块和右侧容器切换
      $('#slideMenu li').removeClass('btnActive');
      $('#slideMenu li').each(function(){
            $(this).click(function(){
                $(this).siblings().removeClass('btnActive')
                $(this).addClass('btnActive');
                var showContent =  '#'+$(this).prop('id');
                // var showContent =  $(this).prop('id');
                $('#content .content-content').addClass('hidden');
                $('#content').find(showContent).removeClass('hidden');
                if(showContent.indexOf('member')!=-1){
                  that.loadMember('','empty');
                  // that.loadMemberTree();
                }else if(showContent.indexOf('platform')!=-1){
                  that.loadPlatform('','empty');
                  // that.loadPlatformTree();
                }
               /* else if(showContent.indexOf('character')!=-1){
                  that.loadCharacter('','empty');
                  that.loadCharacterTree();
                }else if(showContent.indexOf('authority')!=-1){
                  that.loadAuthority('','empty');
                  that.loadAuthorityTree();
                }*/
            })
      });

      $('.table-content').each(function(){
        var height = $(this).parent().height()-$(this).parent().find('h5').height()-$(this).parent().parent().find('.tablefooter').height()-60;
        $(this).height(height);
      });
      // $('.table-content').height($('.table-content').parent().height()-$('.table-content').parent().find('h5').height()-$('.table-content').parent().parent().find('.tablefooter').height()-60);

      // 全选
      $('input.checkAll').off('click').on('click',function(){
        // console.log($(this).parentsUntil('table').parent());
            if($(this).hasClass('selectedAll')){
               $(this).removeClass('selectedAll');
               $(this).parents('.content-content').find('input[type="checkbox"]').prop('checked',false);
            }else{
                $(this).addClass('selectedAll');
                $(this).parents('.content-content').find('input[type="checkbox"]').prop('checked',true);
            }
            // console.log( $(this).parentsUntil('table').parent());
      });

      $('[data-toggle="tooltip"]').tooltip();

      // 权限模块下级菜单的返回
      $('.returnPlatform').off('click').on('click',function(){
        $(this).parents('.content-content').addClass('hidden');
        $('#content #platform').removeClass('hidden');
      })

      $('.search-head-btn').off('click').on('click',function(){
        var inputSearch = $(this).parent().find('input').eq(0);
        if(!inputSearch.val()){
          if(inputSearch.prop('id')=='searchMember'){
            that.tips('搜索用户信息不能为空',1000);
          }else if(inputSearch.prop('id')=='searchCharacter'){
            that.tips('搜索角色信息不能为空',1000);
          }else if(inputSearch.prop('id')=='searchAuthority'){
            that.tips('搜索权限信息不能为空',1000);
          }

        }else{
          that.tips('wait a moment',1000);
        }
      })


      // 顶部的批量删除
      that.removeBatch = function(target){

        var selectTr = target.find('tbody tr input:checked');
        var selectLength = selectTr.length;
        var selectArr = [];
        var deleteManyConfirm = function(){
           var intervel = '';
           intervel = setInterval(function(){
              $('.table-content').css('overflow-x','hidden');
             if(selectTr.length){
                selectTr = target.find('tbody tr input:checked');
                selectArr.push(selectTr.eq(0).parents('tr').prop('id'));
                 selectTr.eq(0).parents('tr').addClass('remove-animation');
                 // var removeTr = $('#memberTable tbody tr input:checked').eq(0).parent().parent();
                 selectTr.eq(0).click();
                 setTimeout(function(){
                   target.find('tbody tr.remove-animation').remove();
                    target.find('tbody tr').each(function(i){
                     // $(this).find('td').eq(0).text(that.setFirstZero(i+1));
                   });
               },2000);
             }else{
              clearInterval(intervel);
              $('.table-content').css('overflow-x','auto');
              $('.checkAll').prop('checked',false);
             }
           },100);
         };

         if(selectLength){
           that.confirms({info:'确定删除这'+selectLength+'条数据吗？'},deleteManyConfirm);
         }else{
           that.tips('请至少选择一条记录');
         }
      };

      $('.action-group #deleteMember').off('click').on('click',function(){
        that.removeBatch($('#memberTable'));
      });
      $('.action-group #deletePlatform').off('click').on('click',function(){
        that.removeBatch($('#platformTable'));
      });
      $('.action-group #deleteAuthority').off('click').on('click',function(){
        that.removeBatch($('#authorityTable'));
      });
      $('.action-group #deleteCharacter').off('click').on('click',function(){
        that.removeBatch($('#characterTable'));
      });

      // 新增用户管理
      $('.member-action #addMember').off('click').on('click',function(){
         $('#newMemberModal .modal-title').html('人员新增');
         // 清空文本框原有内容
         $('#newMemberModal input:text').val('');
         $('#newMemberModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#newMemberModal input:text').eq(0).focus();},800);

      });


      that.updateMemberInfo = function(memberValue){
            $('#newMemberModal .modal-title').html('成员修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newMemberModal input:text').eq(0).val(memberValue[0]);
            $('#newMemberModal input:text').eq(1).val(memberValue[1]);
            $('#newMemberModal input:text').eq(2).val(memberValue[2]);
            $('#newMemberModal input:text').eq(3).val(memberValue[3]);
            $('#newMemberModal input:text').eq(4).val(memberValue[4]);
            $('#newMemberModal input:text').eq(5).val(memberValue[5]);
            $('#newMemberModal input:text').eq(6).val(memberValue[0]);
            $('#newMemberModal input:text').eq(7).val(memberValue[0]);

            $('#newMemberModal').modal({'backdrop':'static'});
            setTimeout(function(){$('#newMemberModal input:text').eq(0).focus();},800);

      };

      that.updatePlatformInfo = function(memberValue){
            $('#newPlatformModal .modal-title').html('基本信息编辑<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newPlatformModal input:text').eq(0).val(memberValue[0]);
            $('#newPlatformModal input:text').eq(1).val(memberValue[1]);

            $('#newPlatformModal').modal({'backdrop':'static'});
            setTimeout(function(){$('#newPlatformModal input:text').eq(0).focus();},800);

      };

      that.updateAuthorityInfo = function(memberValue){
            $('#newAuthorityModal .modal-title').html('权限编辑<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newAuthorityModal input:text').eq(0).val(memberValue[0]);
            $('#newAuthorityModal input:text').eq(1).val(memberValue[1]);
            $('#newAuthorityModal input:text').eq(3).val(memberValue[3]);
            /*$('#newAuthorityModal #loginName').val(memberValue[2]);
            $('#newAuthorityModal #password').val(memberValue[3]);
            $('#newAuthorityModal #sex').val(memberValue[4]);
            $('#newAuthorityModal #workOut').val(memberValue[5]);
            $('#newAuthorityModal #IDNumber').val(memberValue[0]);*/
            // $('#newAuthorityModal #mark').val(memberValue[0]);

            $('#newAuthorityModal').modal({'backdrop':'static'});
            setTimeout(function(){$('#newAuthorityModal input:text').eq(0).focus();},800);

      };

      that.updateCharacterInfo = function(memberValue){
            $('#newCharacterModal .modal-title').html('角色编辑<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newCharacterModal input:text').eq(0).val(memberValue[0]);
            $('#newCharacterModal input:text').eq(1).val(memberValue[1]);
            $('#newCharacterModal input:text').eq(2).val(memberValue[2]);
            $('#newCharacterModal input:text').eq(3).val(memberValue[3]);
            $('#newCharacterModal input:text').eq(4).val(memberValue[4]);
            $('#newCharacterModal input:text').eq(5).val(memberValue[5]);
            $('#newCharacterModal input:text').eq(6).val(memberValue[0]);
            $('#newCharacterModal input:text').eq(7).val(memberValue[0]);

            $('#newCharacterModal').modal({'backdrop':'static'});
            setTimeout(function(){$('#newCharacterModal input:text').eq(0).focus();},800);

      };


      // 单个删除
      that.removeRecorder = function(node){
          var id = $(node).parents('tr').prop('id');
          var deleteConfirm = function(){
            // 防止动画使页面出现滚动条
            $('.table-content').css('overflow-x','hidden');
            $(node).parents('tr').addClass('remove-animation');
            setTimeout(function(){
                var reloadTable =  $(node).parents('table');
                $(node).parents('tr').find('input').click();
                if($(node).parents('tr').find('input').prop('checked')){
                  $(node).parents('tr').find('input').click();
                  // $(node).parents('tr').find('input').prop('checked',false);
                };
                $(node).parents('tr').remove();
                /*reloadTable.find('tbody tr').each(function(i){
                  $(this).find('td').eq(0).text(that.setFirstZero(i+1));
                });*/
            },1000);
            $('.table-content').css('overflow-x','auto');
          };
          that.confirms({'title':'警告','info':'确认删除该数据吗？'},deleteConfirm);
      };

      // 成员  权限赋予
      that.setMemberAuthority = function(memberValue,target){
          // $('#newMemberModal .modal-title').html('修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
          console.log(memberValue);
          $('#memberGiveCharacterModal .modal-title').html('角色分配-'+memberValue[0]);
         // 此处请求所有数据
          $('memberGiveCharacterModal #giveCharacterModal .choice .search .count').text($('#giveCharacterModal #notSet li').length+$('#giveCharacterModal #seted li').length+'/'+$('#giveCharacterModal #seted li').length);

          $('#memberGiveCharacterModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#memberGiveCharacterModal input:text').eq(0).focus();},800);

      };

      // 有变化时，更新表格下方的统计信息
      // that.updateTableBottomInfo = function(target){
      // that.prototype.
      $('#slideMenu li').eq(0).click();

      // 修改用户
      $('.member-action #editMember').off('click').on('click',function(){
          var selectLength = $('#memberTable tbody tr input:checked').length;
          if(!selectLength){
            that.tips('请选择一条记录');
            return;
          }else if(selectLength>1){
            that.tips('最多只能选择一条记录');
            return;
          }

         var memberTr = $('#memberTable tr input:checked').parents('tr');
         // console.log(memberTr);
         var memberValue = [memberTr.find('td').eq(1).text(),memberTr.find('td').eq(2).text(),memberTr.find('td').eq(3).text(),memberTr.find('td').eq(4).text(),memberTr.find('td').eq(5).text()];
         // console.log(memberValue);
         that.updateMemberInfo(memberValue);
      });

      // 用户管理 分配角色
      $('.member-action #toGiveCharacter').off('click').on('click',function(){
          var selectLength = $('#memberTable tbody tr input:checked').length;
          if(!selectLength){
            that.tips('请选择一条记录');
            return;
          }else if(selectLength>1){
            that.tips('最多只能选择一条记录');
            return;
          };
         var memberTr = $('#memberTable tr input:checked').parents('tr');
         // console.log(memberTr);
          var value = [memberTr.find('td').eq(0).text(),memberTr.find('td').eq(1).text(),memberTr.find('td').eq(2).text(),memberTr.find('td').eq(3).text(),memberTr.find('td').eq(4).text()];

         that.setMemberAuthority(value,memberTr);
      });


       // 用户角色管理模态框内 删除已有角色
      $('#memberGiveCharacterModal #choicedCharacter .delete').off('click').on('click',function(){
        var user = 'user';
        var id = '123';
        var char = $(this).prev('.char').text();
        var target = $(this);
        var delteMemberCharacter = function(){
          // 用户确定删除后，将删除角色id上传服务器
          fetch(requestServer.updateMemberCharacter,{method:'POST',body:{id:id}}).then(res=>res.json()).then(data=>{
            console.log(data)
          }).catch(error=>{
            that.tips('网络错误');
          });
          console.log(target);
          target.parent().addClass('remove-animation');
          setTimeout(function(){
            target.parent().remove();
          },1000);
        };
        that.confirms({info:'确定删除'+user+'用户的'+char+'角色吗'},delteMemberCharacter);
      });


       // 权限管理页面

      // 权限  新增系统
      $('.authority-action #addPlatform').off('click').on('click',function(){
         $('#newPlatformModal .modal-title').html('基本信息');
         // 清空文本框原有内容
         $('#newPlatformModal input:text').val('');
         $('#newPlatformModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#newPlatformModal input:text').eq(0).focus();},800);

      });

       // 权限管理页面
       // 新增权限
      $('.authority-action #addAuthority').off('click').on('click',function(){
         $('#newAuthorityModal .modal-title').html('新增权限');
         // 清空文本框原有内容
         $('#newAuthorityModal input:text').val('');
         $('#newAuthorityModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#newAuthorityModal input:text').eq(0).focus();},800);

      });

       // 新增角色
      $('.character-action #addCharacter').off('click').on('click',function(){
         $('#newCharacterModal .modal-title').html('新增角色');
         // 清空文本框原有内容
         $('#newCharacterModal input:text').val('');
         $('#newCharacterModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#newCharacterModal input:text').eq(0).focus();},800);

      });

      $('.character-action #getCharacterPower').off('click').on('click',function(){
         // var judgeParent = $('#content #character .breadcrumb li a').eq(2).text();
         var judgeParent = $(this).parents('tr').find('td').eq(1).text();
         console.log($(this).parents('tr'));
         $('#getCharacterPowerModal .modal-title').html('权限管理-'+judgeParent);
         $('#getCharacterPowerModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#getCharacterPowerModal input:text').eq(0).focus();},800);

      });

      $('.character-action #toMemberPower').off('click').on('click',function(){
         // var judgeParent = $('#content #character .breadcrumb li a').eq(2).text();
         var judgeParent = $(this).parents('tr').find('td').eq(1).text();
         $('#giveMemberPowerModal .modal-title').html('人员赋予-'+judgeParent);
          $('#giveMemberPowerModal .choice .search .count').text('('+($('#giveMemberPowerModal #notSet li').length+$('#giveMemberPowerModal #seted li').length)+'/'+$('#giveMemberPowerModal #seted li').length+')');

         $('#giveMemberPowerModal').modal({'backdrop':'static'});
          setTimeout(function(){$('#giveMemberPowerModal input:text').eq(0).focus();},800);

      });


      $('#getCharacterPowerModal  #power li input[type="checkbox"]').off('click').on('click',function(){
            $(this).parent().parent().toggleClass('active');
      });
      // 穿梭框
      $('#giveMemberPowerModal .areaList li label input[type="checkbox"]').off('click').on('click',function(){
              $(this).parent().parent().toggleClass('active');
      });
      var choiceSet = function(){
        $('#giveMemberPowerModal #notSet li .fa-plus').off('click').on('click',function(){
          $(this).parent().find('input[type="checkbox"]').prop('checked',false);
           var nodeClone = $(this).parent().clone();
           nodeClone.removeClass('active').find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');
           $(this).parent().remove();
           // console.log(nodeClone);
           $('#giveMemberPowerModal #seted').append(nodeClone);
           $('.choice .search .count').text('('+($('#giveMemberPowerModal #notSet li').length+$('#giveMemberPowerModal #seted li').length)+'/'+$('#giveMemberPowerModal #seted li').length+')');
           choiceSet();
           choiceNotSet();
        });
      };
      var choiceNotSet = function(){
        $('#giveMemberPowerModal #seted li .fa-minus').off('click').on('click',function(){
          $(this).parent().find('input[type="checkbox"]').prop('checked',false);
           var nodeClone = $(this).parent().clone();
           nodeClone.removeClass('active').find('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
           $(this).parent().remove();
           $('#giveMemberPowerModal #notSet').append(nodeClone);
           $('.choice .search .count').text('('+($('#giveMemberPowerModal #notSet li').length+$('#giveMemberPowerModal #seted li').length)+'/'+$('#giveMemberPowerModal #seted li').length+')');
           choiceSet();
           choiceNotSet();
        });
      };
      choiceSet();
      choiceNotSet();

      // 角色分配模糊匹配
      $('.choice #search').off('keyup').on('keyup',function(){
         var cacheData = $(this).val();
         for(var i in $('#giveMemberPowerModal #notSet li')){
           if($('#giveMemberPowerModal #notSet li').eq(i).text().indexOf(cacheData)==-1){
             $('#giveMemberPowerModal #notSet li').eq(i).addClass('hidden');
           }else{
             $('#giveMemberPowerModal #notSet li').eq(i).removeClass('hidden');
           }
         }
      });

      $('#giveMemberPowerModal .choice .changicon .left').off('click').on('click',function(){
        if($('#giveMemberPowerModal #seted li input:checked').length){
          $(this).parent().parent().find('.fa-minus').click();
        }else{
          that.tips('请至少选择一条数据');
        }
      });

      $('#giveMemberPowerModal .choice .changicon .right').off('click').on('click',function(){
        if($('#giveMemberPowerModal #notSet li input:checked').length){
         $('#giveMemberPowerModal #notSet li input:checked').parent().parent().find('.fa-plus').click();
        }else{
          that.tips('请至少选择一条数据');
        }
      });




    },
    initPageAction_tree: function(){

      $('#slideMenu').off('mouseout').on('mouseover',function(event) {
        $('#foldTree').removeClass('hidden');
      });

      $('#content').off('mouseenter').on('mouseover',function(event) {
        $('#foldTree').addClass('hidden');
      });

      $('#foldTree').off('click').on('click',function(){
        $('#cancelFoldTree').removeClass('hidden');
        $('#foldTree').addClass('hidden');

        $('.tree-container').removeClass('col-2');
        $('.tree-container').css({'position':'absolute','top':'100px'});
        $('.tree-container').animate({'marginLeft':-$('.tree-container').width()});
        $('#content').removeClass('col-10');
        $('#content').css({'marginLeft':$('.tree-container').width()});
        $('#content').animate({'width':$('body').width(),'marginLeft':0});
        $('#content').css({'paddingLeft':'1rem'});
          setTimeout(function(){
            $('.tree-container').addClass('hidden');
          },1000);
      });

      $('#cancelFoldTree').off('click').on('click',function(){
        $('.tree-container').addClass('col-2');
        $('.tree-container').css({'position':'relative','top':0});
        $('.tree-container').animate({'marginLeft':0});
        $('.tree-container').removeClass('hidden');
        $('#content').addClass('col-10');
        $('#content').css({'paddingLeft':'0rem'});
        // $('#content').animate({'width':'80%'});
        $('#cancelFoldTree').addClass('hidden');
      });

    },
    updateTableBottomInfo: function(target){
      var that = this;
          // console.log(target);
          target.find('#totalTable').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
          target.find('#showCounts').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
          target.find('input[type="checkbox"]').off('change').on('change',function(){
            // console.log(target.find('tbody tr').length);
            target.find('#totalTable').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
            target.find('#showCounts').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
            target.find('#selectedTable').text(target.find('tbody tr input:checked').length+'条数据');
          });

          // 用户管理单个数据操作
          target.find('tr td a.update').off('click').on('click',function(){
            var value = [$(this).parents('tr').find('td').eq(0).text(),$(this).parents('tr').find('td').eq(1).text(),$(this).parents('tr').find('td').eq(2).text(),$(this).parents('tr').find('td').eq(3).text(),$(this).parents('tr').find('td').eq(4).text()];
              console.log(target.prop('id'));
              if(target.prop('id')=='member'){
                that.updateMemberInfo(value,target);
              }else if(target.prop('id')=='platform'){
                that.updatePlatformInfo(value,target);
              }else if(target.prop('id')=='character'){
                that.updateCharacterInfo(value,target);
              }else if(target.prop('id')=='authority'){
                that.updateAuthorityInfo(value,target);
              }

          });

          target.find('tr td a.delete').off('click').on('click',function(){
            var memberValue = [$(this).parents('tr').find('td').eq(1).text(),$(this).parents('tr').find('td').eq(2).text(),$(this).parents('tr').find('td').eq(3).text(),$(this).parents('tr').find('td').eq(4).text(),$(this).parents('tr').find('td').eq(5).text()];
             that.removeRecorder(this,target);
          });

          // 成员  角色赋予
          target.find('tr td a.toGiveCharacter').off('click').on('click',function(){
            var value = [$(this).parents('tr').find('td').eq(0).text(),$(this).parents('tr').find('td').eq(1).text(),$(this).parents('tr').find('td').eq(2).text(),$(this).parents('tr').find('td').eq(3).text(),$(this).parents('tr').find('td').eq(4).text()];

            that.setMemberAuthority(value,target);
          });

          // 角色管理  分配权限
          target.find('tr td a.toGivePower').off('click').on('click',function(){
             // var judgeParent = $('#content #character .breadcrumb li a').eq(2).text();
             var judgeParent = $(this).parents('tr').find('td').eq(0).text();
             console.log($(this).parents('tr'));
             $('#getCharacterPowerModal .modal-title').html('权限管理-'+judgeParent);
             $('#getCharacterPowerModal').modal({'backdrop':'static'});
          });

          // 角色管理  人员赋予
          target.find('tr td a.authorityToMember').off('click').on('click',function(){
             // var judgeParent = $('#content #character .breadcrumb li a').eq(2).text();
             var judgeParent = $(this).parents('tr').find('td').eq(0).text();
             $('#giveMemberPowerModal .modal-title').html('人员赋予-'+judgeParent);
              $('#giveMemberPowerModal .choice .search .count').text('('+($('#giveMemberPowerModal #notSet li').length+$('#giveMemberPowerModal #seted li').length)+'/'+$('#giveMemberPowerModal #seted li').length+')');
             $('#giveMemberPowerModal').modal({'backdrop':'static'});
          });

    },
    loadMember: function(memberArray,ifEmpty){
       /*
       *@param{object,string} memberArray为服务器返回的用户信息；ifEmpty判断是否清空当前表格
       */
        var that = this;
        // 加载管理员信息
        // $('#member input.checkAll').removeClass('checkAll');
        $('#member input[type="checkbox"]').prop('checked',false);
        // console.log($('#member input.checkAll').prop('checked'));
        if(ifEmpty){
          $('#memberTable tbody').empty();
        }
        var memberArray = [
          ['张飞','0','23','123456789','四川省成都市','超级管理员','增加删除'],
          ['吕布','0','23','123456789','上海市','管理员','增加删除'],
          ['关羽','0','23','123456789','云南省昆明市','管理员','增加删除'],
          ['刘备','0','23','123456789','四川省广元市','普通用户','增加删除'],
          ['吕布','0','23','123456789','上海市','管理员','增加删除'],
          ['诸葛武侯','0','23','123456789','上海市','管理员','增加删除'],
          ['吕布','0','23','123456789','上海市','管理员','增加删除'],
          ['司马懿','0','23','123456789','上海市','管理员','增加删除'],
          ['新浪','0','23','123456789','上海市','管理员','增加删除'],
          ['人人','0','23','123456789','上海市','管理员','增加删除'],
          ['貂蝉','0','23','123456789','西藏自治区','超级管理员','增加删除']];
        for(var i in memberArray){
            if(i>9){break;}
            // var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name=""><i class="checkbox"></i></label></th><td>'+that.setFirstZero((parseInt(i)+1))+'</td><td>'+memberArray[i][0]+'</td><td>'+memberArray[i][1]+'</td><td>'+memberArray[i][2]+'</td><td>'+memberArray[i][3]+'</td><td>'+memberArray[i][4]+'</td><td>'+memberArray[i][5]+'</td><td><a href="javascript:void(0)" class="action update" "email me">编辑</a><a href="javascript:void(0)" class="action toGiveCharacter" "email me">分配角色</a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name=""><i class="checkbox"></i></label></th><td>'+memberArray[i][0]+'</td><td>'+memberArray[i][1]+'</td><td>'+memberArray[i][2]+'</td><td>'+memberArray[i][3]+'</td><td>'+memberArray[i][4]+'</td><td>'+memberArray[i][5]+'</td><td>'+memberArray[i][6]+'</td><td><a href="javascript:void(0)" class="action update" "email me">编辑</a><a href="javascript:void(0)" class="action toGiveCharacter" "email me">角色分配</a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
            $('#memberTable tbody').append(element);
        }
        that.updateTableBottomInfo($('#content #member'));
        that.initPagination($('#content #member'),6);
    },
    loadPlatform: function(platformArray,ifEmpty){
      /*
      *@param{object,string} platformArray为服务器返回的平台信息；ifEmpty判断是否清空当前表格
      */
        var that = this;
        // 加载权限列表
        $('#platform  input[type="checkbox"]').prop('checked',false);
        if(ifEmpty){
          $('#platformTable tbody').empty();
        }
        var date  = new Date().getFullYear()+'-'+(parseInt(new Date().getMonth())+1)+'-'+new Date().getDate();
        var platformArray = [
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['红牌楼系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员'],
            ['高升桥系统','云南省昆明市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['茶店子系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','东京市',date,'增加，删除，修改，没设置','管理员、地图定制员'],
            ['高升桥系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员']];
        for(var i in platformArray){
            if(i>9){break;}
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name=""><i class="checkbox"></i></label></th><td>'+platformArray[i][0]+'</td><td>'+platformArray[i][1]+'</td><td>'+platformArray[i][2]+'</td><td>'+platformArray[i][3]+'</td><td>'+platformArray[i][4]+'</td><td><a href="javascript:void(0)" class="action update" "email me">编辑</a><a href="javascript:void(0)" class="action manageAuthority" "email me">权限管理<i class="fa fa-share"></i></a><a href="javascript:void(0)" class="action manageCharacter" "email me">角色管理<i class="fa fa-share"></i></a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
            $('#platformTable tbody').append(element);
        }

        that.updateTableBottomInfo($('#content #platform'));
        that.initPagination($('#content #platform'),100,7);

        $('.manageAuthority').off('click').on('click',function(){
           var Value = [$(this).parents('tr').find('td').eq(0).text(),$(this).parents('tr').find('td').eq(1).text(),$(this).parents('tr').find('td').eq(2).text(),$(this).parents('tr').find('td').eq(3).text(),$(this).parents('tr').find('td').eq(4).text()];
          $('#content #platform').addClass('hidden');
          $('#content #authority').removeClass('hidden');

           that.loadAuthority('','empty',Value);
           // that.loadAuthorityTree();
           that.updateTableBottomInfo($('#content #authority'));
           that.initPagination($('#content #authority'),30,7);
        });

        $('.manageCharacter').off('click').on('click',function(){
            var Value = [$(this).parents('tr').find('td').eq(0).text(),$(this).parents('tr').find('td').eq(1).text(),$(this).parents('tr').find('td').eq(2).text(),$(this).parents('tr').find('td').eq(3).text(),$(this).parents('tr').find('td').eq(4).text()];
           // console.log(111);
           $('#content #platform').addClass('hidden');
           $('#content #character').removeClass('hidden');

           that.loadCharacter('','empty',Value);
           // that.loadCharacterTree();
           that.updateTableBottomInfo($('#content #character'));
           that.initPagination($('#content #character'),50,7);
        })
    },
    loadAuthority: function(authorityArray,ifEmpty,parent){
      /*
      *@param{object,string,object} authorityArray为服务器返回的权限信息；ifEmpty判断是否清空当前表格；parent为当前权限所在系统平台
      */
        var that = this;
        // 加载权限列表
        $('#authority input[type="checkbox"]').prop('checked',false);
        $('#content #authority .breadcrumb li a').eq(2).text(parent[0]);
        if(ifEmpty){
          $('#authorityTable tbody').empty();
        }
        var date  = new Date().getFullYear()+'-'+(parseInt(new Date().getMonth())+1)+'-'+new Date().getDate();
        var authorityArray = [
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['红牌楼系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员'],
            ['高升桥系统','云南省昆明市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['茶店子系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','上海市',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员'],
            ['成都东站系统','东京市',date,'增加，删除，修改，没设置','管理员、地图定制员'],
            ['高升桥系统','道路障碍',date,'增加，删除，修改，没设置','管理员、新闻发布员、地图定制员']];
        for(var i in authorityArray){
            if(i>9){break;}
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name=""><i class="checkbox"></i></label></th><td>'+authorityArray[i][0]+'</td><td>'+authorityArray[i][1]+'</td><td>'+authorityArray[i][2]+'</td><td>'+authorityArray[i][3]+'</td><td>'+authorityArray[i][4]+'</td><td><a href="javascript:void(0)" class="action update" "email me">编辑</a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
            $('#authorityTable tbody').append(element);
        }
            that.updateTableBottomInfo($('#content #authority'));
            that.initPagination($('#content #authority'),100,7);
    },
    loadCharacter: function(characterArray,ifEmpty,parent){
      /*
      *@param{object,string,object} characterArray为服务器返回的角色信息；ifEmpty判断是否清空当前表格；parent为当前角色所在系统平台
      */
        var that = this;
        // 加载角色列表
        $('#character input[type="checkbox"]').prop('checked',false);
        $('#content #character .breadcrumb li a').eq(2).text(parent[0]);
        if(ifEmpty){
          $('#characterTable tbody').empty();
        }
        var date  = new Date().getFullYear()+'-'+(parseInt(new Date().getMonth())+1)+'-'+new Date().getDate();
        var characterArray = [
          ['高升桥',date,'云南省昆明市','管理员','一周检查两次'],
          ['红牌楼',date,'道路障碍','路面损毁','一周检查一次'],
          ['高升桥',date,'云南省昆明市','管理员','一周检查两次'],
          ['高升桥',date,'云南省昆明市','管理员','一周检查两次'],
          ['茶店子',date,'道路障碍','路面损毁','这个管理员很少上线'],
          ['成都东站',date,'上海市','管理员','一周检查一次'],
          ['高升桥',date,'道路障碍','路面损毁','一周检查两次']];
        for(var i in characterArray){
            if(i>9){break;}
            // var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name="" <i class="checkbox"></i></label>></th><td>'+that.setFirstZero((parseInt(i)+1))+'</td><td>'+characterArray[i][0]+'</td><td>'+characterArray[i][1]+'</td><td>'+characterArray[i][2]+'</td><td>'+characterArray[i][3]+'</td><td>'+characterArray[i][4]+'</td><td><a href="javascript:void(0)" class="action edit" "email me">修改</a><a href="javascript:void(0)" class="action toGivePower" "email me">分配权限</a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><label class="checkbox-label"><input type="checkbox" name=""><i class="checkbox"></i></label></th><td>'+characterArray[i][0]+'</td><td>'+characterArray[i][1]+'</td><td>'+characterArray[i][2]+'</td><td>'+characterArray[i][3]+'</td><td>'+characterArray[i][4]+'</td><td><a href="javascript:void(0)" class="action update" "email me">编辑</a><a href="javascript:void(0)" class="action toGivePower" "email me">分配权限</a><a href="javascript:void(0)" class="action authorityToMember" "email me">人员赋予</a><a href="javascript:void(0)" class="action delete text-danger" "email me">删除</a></td></tr>';
              $('#characterTable tbody').append(element);
        }
        that.updateTableBottomInfo($('#content #character'));
        that.initPagination($('#content #character'),7);
    },
    loadMemberTree: function(data){
      var that = this;
      var tree = [
       {
       text: "区域1",
       state: {
          checked:false,disabled:false,expanded:true,selected:true
        },
       tags:["<i class='fa fa-pencil-square-o'></i>","<i class='fa fa-minus-circle'></i>","<i class='fa fa-plus-circle'></i>"],
       nodes: [
        {
        text: "区域1",
        nodes: [{text: "区域1",nodes:[{
       text: "区域2"
       },{
       text: "区域3",nodes:[{
       text: "区域2"
       },{
       text: "区域3"
       },{
       text: "区域4"
       },{
       text: "区域5",
       }]
       },{
       text: "区域4"
       },{
       text: "区域5"
       }]},{text: "区域"}]
        },{text: "区域2"},{
       text: "区域2"
       },{
       text: "区域3",
       nodes:[{
       text: "区域5"
       }]
       },{
       text: "区域4"
       },{
       text: "区域5"
       }]
       },
       {
       text: "区域2"
       },{
       text: "区域3",nodes:[{
       text: "区域5"
       }]
       },{
       text: "区域4"
       },{
       text: "区域5"
       }
      ];
      that.handleTreeData = function(data){
        for(var i in data){
          data[i].tags = ["<i class='fa fa-plus-circle'></i>","<i class='fa fa-minus-circle'></i>","<i class='fa fa-pencil-square-o'></i>"];
          if(data[i].nodes){
            // console.log(data[i].nodes);
            // data[i].nodes = that.handleTreeData(data[i].nodes);
            that.handleTreeData(data[i].nodes);
          }
        }
        // console.log(data);
        return data;
      };
      var handleTree = that.handleTreeData(tree);

      $('#memberTree').treeview({
        data:handleTree,levels:2,
        checkedIcon:'fa fa-plus',
        expandIcon:'fa fa-caret-right',
        collapseIcon:'fa fa-caret-down',
        onhoverColor:'#fcfcfc',
        selectedBackColor:'#fff',
        selectedColor:'#4477ee',
        showTags:true,
        // highlightSelected:false,
        onNodeSelected:function(event,node){
          console.log(node);
        },
        onNodeUnchecked:function(event, node){

        },
        onNodeUnselected:function(event, node){

        }
      });

      // 废弃
      $('.tree-container').off('click').on('click',function(ev){
        clickTarget = ev.target;
        var clickNode = $('#memberTree').treeview('getSelected')[0];
        // console.log(ev.target);
        // console.log(clickNode);
        if($(clickTarget).hasClass('fa-plus-circle')){
          $('#memberNodeModal .modal-title').html('新增节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#memberNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-pencil-square-o')){
          $('#memberNodeModal .modal-title').html('修改节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#memberNodeModal input').eq(0).val(clickNode.text);
          $('#memberNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-minus-circle')){
          var deleteMemberNode = function(){

          };
          that.confirms({title:'删除节点',info:'该节点下的所有子节点及其人员都会删除，确认删除吗？'},deleteMemberNode);
        };
      });

      // $('#memberTree').treeview({});
    },
    loadCharacterTree: function(data){
      var that = this;
      var tree = [
       {
       text: "角色1",
       state: {
          checked:false,disabled:false,expanded:true,selected:true
        },
       nodes: [
        {
        text: "角色1",
        nodes: [{text: "角色1",nodes:[{
       text: "角色2"
       },{
       text: "角色3",nodes:[{
       text: "角色2"
       },{
       text: "角色3"
       },{
       text: "角色4"
       },{
       text: "角色5"
       }]
       },{
       text: "角色4"
       },{
       text: "角色5"
       }]},{text: "角色的角色2"}]
        },{text: "角色的角色2"},{
       text: "角色2"
       },{
       text: "角色3"
       },{
       text: "角色4"
       },{
       text: "角色5"
       }]
       },
       {
       text: "角色2"
       },{
       text: "角色3"
       },{
       text: "角色4"
       },{
       text: "角色5"
       }
      ];
      var handleTree = that.handleTreeData(tree);

      $('#memberTree').treeview({
        data:handleTree,levels:1,
        checkedIcon:'fa fa-plus',
        expandIcon:'fa fa-caret-right',
        collapseIcon:'fa fa-caret-down',
        onhoverColor:'#fcfcfc',
        selectedBackColor:'#fff',
        selectedColor:'#4477ee',
        showTags:true,
        // highlightSelected:false,
        onNodeSelected:function(event,node){
          $('.tree .list-group-item.node-memberTree').each(function(){
              $(this).off('click').on('click',function(){

              })
            })
        },
        onNodeUnchecked:function(event, node){

        },
        onNodeUnselected:function(event, node){
          // console.log(node);
          $('.tree .list-group-item.node-memberTree').each(function(){
            $(this).off('click').on('click',function(){
              // $(this).css({'color': '#FFFFFF','backgroundColor': '#428bca'});
              console.log(111);
            })
          })
        }
      });

      $('.tree-container').off('click').on('click',function(ev){
        clickTarget = ev.target;
        var clickNode = $('#memberTree').treeview('getSelected')[0];
        // console.log(ev.target);
        // console.log(clickNode);
        if($(clickTarget).hasClass('fa-plus-circle')){
          $('#characterNodeModal .modal-title').html('新增节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#characterNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-pencil-square-o')){
          $('#characterNodeModal .modal-title').html('修改节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#characterNodeModal input').eq(0).val(clickNode.text);
          $('#characterNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-minus-circle')){
          var deleteCharacterNode = function(){

          };
          that.confirms({title:'删除节点',info:'该节点下的所有子节点及其人员都会删除，确认删除吗？'},deleteCharacterNode);
        };
      });
    },
    loadAuthorityTree: function(data){

      var that = this;
      var tree = [
       {
       text: "权限1",
       state: {
          checked:false,disabled:false,expanded:true,selected:true
        },
       nodes: [
        {
        text: "权限1",
        nodes: [{text: "权限的权限2",nodes:[{
       text: "权限2"
       },{
       text: "权限3",nodes:[{
       text: "权限2"
       },{
       text: "权限3"
       },{
       text: "权限4"
       },{
       text: "权限5"
       }]
       },{
       text: "权限4"
       },{
       text: "权限5"
       }]},{text: "权限的权限2"}]
        },{text: "权限的权限2"},{
       text: "权限2"
       },{
       text: "权限3"
       },{
       text: "权限4"
       },{
       text: "权限5"
       }]
       },
       {
       text: "权限2"
       },{
       text: "权限3"
       },{
       text: "权限4"
       },{
       text: "权限5"
       }
      ];
      var handleTree = that.handleTreeData(tree);
      $('#memberTree').treeview({
        data:handleTree,levels:1,
        checkedIcon:'fa fa-plus',
        expandIcon:'fa fa-caret-right',
        collapseIcon:'fa fa-caret-down',
        onhoverColor:'#fcfcfc',
        selectedBackColor:'#fff',
        selectedColor:'#4477ee',
        showTags:true,
        // highlightSelected:false,
        onNodeSelected:function(event,node){
          $('.tree .list-group-item.node-memberTree').each(function(){
              $(this).off('click').on('click',function(){

              })
            })
        },
        onNodeUnchecked:function(event, node){

        },
        onNodeUnselected:function(event, node){
          // console.log(node);
          $('.tree .list-group-item.node-memberTree').each(function(){
            $(this).off('click').on('click',function(){
              // $(this).css({'color': '#FFFFFF','backgroundColor': '#428bca'});
              console.log(111);
            })
          })
        }
      });

      $('.tree-container').off('click').on('click',function(ev){
        clickTarget = ev.target;
        var clickNode = $('#memberTree').treeview('getSelected')[0];
        // console.log(ev.target);
        // console.log(clickNode);
        if($(clickTarget).hasClass('fa-plus-circle')){
          $('#authorityNodeModal .modal-title').html('新增权限节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#authorityNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-pencil-square-o')){
          $('#authorityNodeModal .modal-title').html('修改权限节点<small style="padding-left:.5rem">'+clickNode.text+'</small>');
          $('#authorityNodeModal input').eq(0).val(clickNode.text);
          $('#authorityNodeModal').modal({backdrop:'static'});
        };

        if($(clickTarget).hasClass('fa-minus-circle')){
          var deleteAuthorityNode = function(){

          };
          that.confirms({title:'删除节点',info:'确认删除该权限吗？'},deleteAuthorityNode);
        };
      });

      // $('#memberTree').treeview({});
    },
    initPagination: function(target,totalPage,pageCount){
      /*
      * @param {object,number,number} target为分页器所在容器jQuery节点；totalPage为总页面；pageCount为每次切换的页码数量
      */
      var that = this;
      // var this.initPagination.prototype = initPagination;
      totalPage -= 1;
      pageCount = (pageCount)?(pageCount):(6);
      var matchPagination = target.find('.pagination').eq(0);
      // 先清空原有页码，再添加新的
      matchPagination.empty();

      if(totalPage<pageCount-1){
        pageCount = totalPage;
      }

      // 当翻页后，上一页按钮的操作
      this.initPagination.initPrePageCount = function(prePage_import){
            var prePage = '';
            // console.log(prePage_import);
            if(!prePage_import){
              prePage = parseInt(target.find('.page-num.page-change').first().prop('id').replace(/page-num-/,''));
            }else{
              prePage = prePage_import;
            };
            // console.log(prePage,pageCount);

            var pageCountClone2 = pageCount;

            // 当剩余页数大于每次切换的页数时，显示下翻的按钮，反之隐藏
            if(totalPage-prePage+2>=pageCount){
                target.find('#page-num-more').show();
                // pageCountClone2 = pageCount
            }else{
              pageCountClone2 -= 1;
              target.find('#page-num-more').hide();
            }

            target.find('.page-num.page-change').remove();

            // 当剩余页数小于每次切换的页数时，需将剩余页数重置为切换页数，且隐藏上翻的按钮
            if(prePage<=(pageCount+1)){
              if(totalPage>pageCount){
                 prePage = pageCount + 1;
              }
              target.find('#page-num-morePre').hide();
            }else{
              target.find('#page-num-morePre').show();
            }

            // console.log(prePage,pageCount);
            // 从上一页的最后一页开始后翻
            for(var i = prePage;i>2;i--){
              if(i==prePage-pageCountClone2){
                break;
              }
              var len_2 ='<li class="page-item page-num page-change page-tool" id="page-num-'+(i-1)+'"><a class="page-link" href="#">'+(i-1)+'</a></li>';
                matchPagination.find('#page-num-morePre').after(len_2);
            };

            target.find('.pagination li.active').removeClass('active');
            // 页码刷新后，重新添加点击事件，传参最小页码和最大页码
            that.changePagination(target,totalPage+1,1,'');
            // 如果点击的是最后一页，将选中状态传递给最后一页，反之传给每次切换完成后最后一个，模拟点击事件
            if(prePage_import){
              target.find('.pagination li#page-num-'+(totalPage+1)).addClass('active');
              // target.find('.pagination li#page-num-'+(totalPage+1)).click();
            }else{
              // target.find('.pagination li.page-num.page-change').last().addClass('active');
              console.log(target.find('.pagination li.page-num.page-change').last());
              target.find('.pagination li.page-num.page-change').last().click();
            }
            // target.find('.pagination li.page-num').last().click();
      };

      // 下一页按钮的操作
      this.initPagination.initNextPageCount = function(nextPage_import){
        var nextPage = null;
        // console.log(nextPage_import);
        // 当翻过第一页后，向回翻的按钮显示
        if(!nextPage_import){
          nextPage = parseInt(target.find('.page-num.page-change').last().prop('id').replace(/page-num-/,''));
        }else{
          nextPage = nextPage_import;
          // target.find('#page-num-more').hide();
        }

        target.find('.page-num.page-change').remove();
        if(nextPage>=totalPage-pageCount){
          target.find('#page-num-more').hide();
          if(totalPage<=pageCount){
            nextPage = ((totalPage+1)-pageCount)?(totalPage-pageCount):(1);
          }else{
            // target.find('#page-num-more').show();
            nextPage = totalPage - pageCount + 1;
          }
        }else{
          target.find('#page-num-more').show();
        }

        var pageCountClone = pageCount;

        // console.log(nextPage,pageCount);
        if((nextPage+1)>pageCount){
          target.find('#page-num-morePre').show();
        }else{
          pageCountClone -= 1;
          target.find('#page-num-morePre').hide();
        };

        // console.log(nextPage,pageCount,totalPage);
        for(var i = nextPage;i<totalPage;i++){
          if(i==nextPage+pageCountClone&&totalPage>pageCountClone){
            break;
          }
          var len_2 ='<li class="page-item page-num page-change page-tool" id="page-num-'+(i+1)+'"><a class="page-link" href="#">'+(i+1)+'</a></li>';
          matchPagination.find('#page-num-more').before(len_2);
        };

        target.find('.pagination li.active').removeClass('active');

        that.changePagination(target,totalPage+1,'',totalPage+1);
        if(nextPage_import){
          target.find('.pagination li#page-num-'+nextPage_import).addClass('active');
        }else{
          // target.find('.pagination li.page-num.page-change').first().addClass('active');
          target.find('.pagination li.page-num.page-change').first().click();
        }
        // target.find('.pagination li.page-num').first().click();
      };

      // 插入上一页
      matchPagination.append('<li class="page-item page-change page-tool previousPage"><a class="page-link" href="#" aria-label="Previous" title="上一页"><span aria-hidden="true">上页</span><span class="sr-only">Previous</span></a></li><li class="page-item page-tool page-num" id="page-num-1"><a class="page-link" href="#">'+1+'</a></li>');
      if(!target.find('#page-num-morePre').length){
        var moreLenPre ='<li class="page-item" title="向前移" style="display:none" id="page-num-morePre"><a class="page-link" href="#">...</a></li>';
        matchPagination.find('.previousPage').next().after(moreLenPre);
        target.find('#page-num-morePre').off('click').on('click',function(){
          that.initPagination.initPrePageCount();
        })
      }else{
        target.find('#page-num-morePre').show();
      };

      if(target.find('#page-num-more').length){
        target.find('#page-num-more').show();
      }else{
        var moreLen ='<li class="page-item" title="向后移" style="display:none" id="page-num-more"><a class="page-link" href="#">...</a></li>';
        matchPagination.append(moreLen);
        // return false;
      };
      target.find('#page-num-more').off('click').on('click',function(){
        that.initPagination.initNextPageCount();
      });
      for(var i=1;i<totalPage;i++){
          if(i==pageCount){
            // 当页数多过默认显示时，后翻按钮显示
            target.find('#page-num-more').show();
            break;
          }
          var len ='<li class="page-item page-change page-tool page-num" id="page-num-'+(i+1)+'"><a class="page-link" href="#">'+(i+1)+'</a></li>';
          matchPagination.find('#page-num-more').before(len);
      };

      // console.log(target.find('#page-num-more'));
      matchPagination.append('<li class="page-item page-tool page-num" id="page-num-'+(totalPage+1)+'"><a class="page-link" href="#">'+(totalPage+1)+'</a></li><li class="page-item page-change page-tool nextPage" title="下一页"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">下页</span><span class="sr-only">Next</span></a></li>');

      target.find('.pagination li.active').removeClass('active');
      target.find('.pagination li.page-num').first().addClass('active');
      that.changePagination(target,totalPage+1);
    },
    changePagination: function(target,totalPage,pageRangeMin,pageRangeMax){
      /*
      *@param {object,number,number,number} target为分页器所在容器的外层jQuery节点；totalpage为页码总数；pageRangeMin为当前切换的第一页；pageRangeMax为当前切换的最后一页
      * pageRangeMin和pageRangeMax由外部传入，是为了不影响固定的第一页和最后一页
      */
      var that = this;
      target.find('.pagination li.page-tool').off('click').on('click',function(i){
        if(!pageRangeMin){
           pageRangeMin = parseInt(target.find('.pagination li.page-num').first().prop('id').replace(/page-num-/,''));
        };
        if(!pageRangeMax){
           pageRangeMax = parseInt(target.find('.pagination li.page-num').last().prop('id').replace(/page-num-/,''));
        };
        var oldPage = parseInt($(this).prop('id').replace(/page-num-/,''));

        var changedPage = '1';
        if(target.find('.pagination li.active').length){
            changedPage = parseInt(target.find('.pagination li.active').prop('id').replace(/page-num-/,''));
        }

        // 根据点击的位置读取申请的页码
        if($(this).hasClass('previousPage')){
          if(changedPage<=1){
            that.tips('当前已经是第一页');return false;
          }else{
            changedPage -= 1;
            if(changedPage < pageRangeMin || !target.find('#page-num-'+changedPage).length){
              target.find('#page-num-morePre').click();
            }
          }
        }else if($(this).hasClass('nextPage')){
          if(changedPage>=totalPage){
            that.tips('当前已经是最后一页');return false;
          }else{
            changedPage += 1;
            if(changedPage > pageRangeMax || !target.find('#page-num-'+changedPage).length){
              target.find('#page-num-more').click();
            }
          }
        }else{
          changedPage = oldPage;
        }

        // console.log($(this).prop('id'),totalPage);
        if($(this).prop('id')=="page-num-1"){
          that.initPagination.initNextPageCount(1);
        }else if($(this).prop('id')=='page-num-'+totalPage){
          that.initPagination.initPrePageCount(totalPage);
        }
      // console.log(oldPage,changedPage,pageRangeMin,pageRangeMax);
        // 此处请求服务器翻页数据
      fetch(requestURL.changedPage+'?changedPage='+changedPage).then(res=>res.json()).then(data=>{
          console.log(data);
        }).catch(error=>{
          // console.log($('#page-num-'+changedPage));
          that.tips('网络出错');
          // 请求成功后，清除原选中状态，切换active到选中的页码
          target.find('.pagination li.active').removeClass('active');
          target.find('#page-num-'+changedPage).addClass('active');
        });
      });
    },
    setFirstZero: function(num){
        /*
         * 小于10的数字，添0格式化
         * @param {number} num 需要格式化的数字
        */
        if(num<10){
                return '0'+num;
        }else{
            return num;
        }
    },
    tips: function(msg,delay){
        /*
        * 消息通知
        * @param{string，number} msg 显示的信息；delay显示时间
        */
        var tip_cont =  "<div class='tips'><span>";tip_cont += msg;tip_cont +='</span></div>';
        if ($('.tips')[0]) {
            $('.tips').remove();
        }
        $('body').append(tip_cont);
        $('.tips').addClass('fromBottom');
        // $('.tips').animate({top:'80%',opacity:1});
        $('.tips').animate({bottom:'20%',opacity:1});
        var delay=(delay)?(delay):(2000);
        $('.tips').show().delay(delay).animate({bottom:'22%',opacity:0},
            function(){
                $(this).remove();
            });
    },
    confirms: function(msg,yes,no){
        /*
        * 消息通知
        * @param{object，function,function} msg：json，{title:''，info:''},分别为显示的标题与显示内容；yes与no为选择后执行的函数
        */
        var that = this;
        var id = new Date().getTime();
        var title = (msg.title)?(msg.title):"提示";
        var confirms_fade = '<div class="confirms-layer-shade" id="fade'+id+'" times="3"></div>';
        var confirm_cont =  '<div class="confirms-layer confirms-layer-dialog layer-anim" id="confirms'+id+'" type="dialog" times="3" showtime="0" contype="string" ><div class="confirms-layer-title">'+title+'</div><div id="" class="confirms-layer-content confirms-layer-padding"><i class="confirms-layer-ico confirms-layer-ico3"></i>'+msg.info+'</div><span class="confirms-layer-setwin"><a class="confirms-layer-ico confirms-layer-close confirms-layer-close1" href="javascript:;"></a></span><div class="confirms-layer-btn confirms-layer-btn-"><a class="confirms-layer-sure">确定</a><a class="confirms-layer-cancel">取消</a></div><span class="confirms-layer-resize"></span></div>';
             // console.log(confirm_cont);
            $('body').append(confirms_fade);
            $('body').append(confirm_cont);
            var top = ($('body').height()-$('.confirms-layer-dialog').height())/2-$('body').height()/10;
            var left = ($('body').width()-$('.confirms-layer-dialog').width())/2;
            // console.log(top,left);
            $('.confirms-layer-dialog').css({'top':top-10+'px','left':left+'px',opacity:0});
            $('.confirms-layer-dialog').animate({'top':top+'px',opacity:1});
            var foundFadeTarget = '#fade'+id;
            var foundTarget = '#confirms'+id;
            $(foundTarget).find('.confirms-layer-close').eq(0).off('click').on('click',function(){
                $(foundFadeTarget).fadeOut();
                $(foundTarget).fadeOut();
            })
            $(foundTarget).find('.confirms-layer-sure').eq(0).off('click').on('click',function(){
                $(foundFadeTarget).fadeOut();
                $(foundTarget).fadeOut();
                (yes)?(yes()):(console.log('null'));
            })

            $(foundTarget).find('.confirms-layer-cancel').eq(0).off('click').on('click',function(){
                $(foundFadeTarget).fadeOut();
                $(foundTarget).fadeOut();
                (no)?(no()):(null);
            })
    }


}



