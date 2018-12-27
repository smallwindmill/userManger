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
    initPageAction:function(){
      var that = this;

      /*$('.tree-container').off('click').on('click',function(ev){
        that.clickTarget = ev.target;
      });*/

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
                  that.loadMemberTree();
                }else if(showContent.indexOf('character')!=-1){
                  that.loadCharacter('','empty');
                  that.loadCharacterTree();
                }else if(showContent.indexOf('authority')!=-1){
                  that.loadAuthority('','empty');
                  that.loadAuthorityTree();
                }
            })
      });


      $('.table-content').height($('.table-content').parent().height()-$('.table-content').parent().find('h5').height()-$('.table-content').parent().parent().find('.tablefooter').height()-60);



      // 全选
      $('input.checkAll').off('click').on('click',function(){
            if($(this).hasClass('selectedAll')){
               $(this).removeClass('selectedAll');
               $(this).parentsUntil('table').parent().find('input[type="checkbox"]').prop('checked',false);
            }else{
                $(this).addClass('selectedAll');
                $(this).parentsUntil('table').parent().find('input[type="checkbox"]').prop('checked',true);
            }
            // console.log( $(this).parentsUntil('table').parent());
      });

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


      // 顶部用户批量删除
      that.removeBatch = function(target){
        var selectTr = target.find('tbody tr input:checked');
        var selectLength = selectTr.length;
         var selectArr = [];
         var deleteManyConfirm = function(){
           var intervel = '';
           intervel = setInterval(function(){
             if(selectTr.length){
                selectTr = target.find('tbody tr input:checked');
                selectArr.push(selectTr.eq(0).parent().parent().prop('id'));
                 selectTr.eq(0).parent().parent().addClass('remove-animation');
                 // var removeTr = $('#memberTable tbody tr input:checked').eq(0).parent().parent();
                 selectTr.eq(0).click();
                 setTimeout(function(){
                   target.find('tbody tr.remove-animation').remove();
                    target.find('tbody tr').each(function(i){
                     $(this).find('td').eq(0).text(that.setFirstZero(i+1));
                   });
               },2000);
             }else{
              clearInterval(intervel);
             }
           },100);
         };

         if(selectLength){
           that.confirms({info:'确定删除这'+selectLength+'条数据吗？'},deleteManyConfirm);
         }else{
           that.tips('请至少选择一条记录');
         }
      };
      /*$('.action-group #deleteMember').off('click').on('click',function(){
         var selectLength = $('#memberTable tbody tr input:checked').length;
         var selectArr = [];
         var deleteManyConfirm = function(){
           var intervel = '';
           // for(var i=0;i<$('#memberTable tbody tr input:checked').length;i++){
           intervel = setInterval(function(){
             if($('#memberTable tbody tr input:checked').length){
                selectArr.push($('#memberTable tbody tr input:checked').eq(0).parent().parent().prop('id'));
                 $('#memberTable tbody tr input:checked').eq(0).parent().parent().addClass('remove-animation');
                 // var removeTr = $('#memberTable tbody tr input:checked').eq(0).parent().parent();
                 $('#memberTable tbody tr input:checked').eq(0).click();
                 setTimeout(function(){
                   // removeTr.remove();
                   $('#memberTable tbody tr.remove-animation').remove();
                   $('#memberTable tbody tr').each(function(i){
                     $(this).find('td').eq(0).text(that.setFirstZero(i+1));
                   });
               },2000);
                // console.log($('#memberTable tbody tr input:checked').length);
             }else{
              clearInterval(intervel);
             }
           },100);
         };
         // console.log(selectArr);

         if(selectLength){
           that.confirms({info:'确定删除这'+selectLength+'条数据吗？'},deleteManyConfirm);
         }else{
           that.tips('请至少选择一条记录');
         }
      });*/
      $('.action-group #deleteMember').off('click').on('click',function(){
        that.removeBatch($('#memberTable'));
      });
      $('.action-group #deleteCharacter').off('click').on('click',function(){
        that.removeBatch($('#characterTable'));
      });
      $('.action-group #deleteAuthority').off('click').on('click',function(){
        that.removeBatch($('#authorityTable'));
      });

      // 新增用户管理
      $('.member-action #addMember').off('click').on('click',function(){
         $('#newMemberModal .modal-title').html('新增人员');
         $('#newMemberModal').modal({'backdrop':'static'});
      });


      that.updateMemberInfo = function(memberValue){
            $('#newMemberModal .modal-title').html('成员修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newMemberModal #name').val(memberValue[0]);
            $('#newMemberModal #post').val(memberValue[1]);
            $('#newMemberModal #loginName').val(memberValue[2]);
            $('#newMemberModal #password').val(memberValue[3]);
            $('#newMemberModal #sex').val(memberValue[4]);
            $('#newMemberModal #workOut').val(memberValue[5]);
            $('#newMemberModal #IDNumber').val(memberValue[0]);
            $('#newMemberModal #mark').val(memberValue[0]);

            $('#newMemberModal').modal({'backdrop':'static'});
      };

      that.updateCharacterInfo = function(memberValue){
            $('#newCharacterModal .modal-title').html('角色修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newCharacterModal #name').val(memberValue[0]);
            $('#newCharacterModal #post').val(memberValue[1]);
            $('#newCharacterModal #loginName').val(memberValue[2]);
            $('#newCharacterModal #password').val(memberValue[3]);
            $('#newCharacterModal #sex').val(memberValue[4]);
            $('#newCharacterModal #workOut').val(memberValue[5]);
            $('#newCharacterModal #IDNumber').val(memberValue[0]);
            $('#newCharacterModal #mark').val(memberValue[0]);

            $('#newCharacterModal').modal({'backdrop':'static'});
      };

      that.updateAuthorityInfo = function(memberValue){
            $('#newAuthorityModal .modal-title').html('权限修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
            $('#newAuthorityModal #name').val(memberValue[0]);
            $('#newAuthorityModal #post').val(memberValue[1]);
            $('#newAuthorityModal #loginName').val(memberValue[2]);
            $('#newAuthorityModal #password').val(memberValue[3]);
            $('#newAuthorityModal #sex').val(memberValue[4]);
            $('#newAuthorityModal #workOut').val(memberValue[5]);
            $('#newAuthorityModal #IDNumber').val(memberValue[0]);
            $('#newAuthorityModal #mark').val(memberValue[0]);

            $('#newAuthorityModal').modal({'backdrop':'static'});
      };

      that.removeRecorder = function(node){
         // 单个删除
          var id = $(node).parent().parent().prop('id');
          var deleteConfirm = function(){
            $(node).parent().parent().addClass('remove-animation');
            setTimeout(function(){
                var reloadTable =  $(node).parents('table');
                if($(node).parent().parent().find('input').prop('checked')){
                  $(node).parent().parent().find('input').click();
                };
                $(node).parent().parent().remove();
                reloadTable.find('tbody tr').each(function(i){
                  $(this).find('td').eq(0).text(that.setFirstZero(i+1));
                });
            },1000);
          };
          that.confirms({'title':'警告','info':'确认删除该用户吗？'},deleteConfirm);
      };

      that.setMemberAuthority = function(memberValue){
          // $('#newMemberModal .modal-title').html('修改<small style="padding-left:.5rem">'+memberValue[0]+'</small');
          $('#newMemberModal #name').val(memberValue[0]);
          $('#newMemberModal #post').val(memberValue[1]);
          $('#newMemberModal #loginName').val(memberValue[2]);
          $('#newMemberModal #password').val(memberValue[3]);
          $('#newMemberModal #sex').val(memberValue[4]);
          $('#newMemberModal #workOut').val(memberValue[5]);
          $('#newMemberModal #IDNumber').val(memberValue[0]);
          $('#newMemberModal #mark').val(memberValue[0]);
          $('#giveCharacterModal .choice .search .count').text($('#giveCharacterModal #notSet li').length+$('#giveCharacterModal #seted li').length+'/'+$('#giveCharacterModal #seted li').length);

          $('#giveCharacterModal').modal({'backdrop':'static'});
      };

      // 有变化时，更新表格下方的统计信息
      that.updateTableBottomInfo = function(target){
          // console.log(target);
          target.find('#totalTable').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
          target.find("input:checkbox").off('change').on('change',function(){
            // console.log(target.find('tbody tr').length);
            target.find('#totalTable').text(target.find('tbody tr').length-target.find('tbody tr.remove-animation').length+'条数据');
            target.find('#selectedTable').text(target.find('tbody tr input:checked').length+'条数据');
          });

          // 用户管理单个数据操作
          target.find('tr td a.update').off('click').on('click',function(){
            var memberValue = [$(this).parent().parent().find('td').eq(1).text(),$(this).parent().parent().find('td').eq(2).text(),$(this).parent().parent().find('td').eq(3).text(),$(this).parent().parent().find('td').eq(4).text(),$(this).parent().parent().find('td').eq(5).text()];
              console.log(target.prop('id'));
              if(target.prop('id')=='member'){
                that.updateMemberInfo(memberValue,target);
              }else if(target.prop('id')=='character'){
                that.updateCharacterInfo(memberValue,target);
              }else if(target.prop('id')=='authority'){
                that.updateAuthorityInfo(memberValue,target);
              }

          });

          target.find('tr td a.delete').off('click').on('click',function(){
            var memberValue = [$(this).parent().parent().find('td').eq(1).text(),$(this).parent().parent().find('td').eq(2).text(),$(this).parent().parent().find('td').eq(3).text(),$(this).parent().parent().find('td').eq(4).text(),$(this).parent().parent().find('td').eq(5).text()];
             that.removeRecorder(this,target);
          });

          target.find('tr td a.toGiveCharacter').off('click').on('click',function(){
            var memberValue = [$(this).parent().parent().find('td').eq(1).text(),$(this).parent().parent().find('td').eq(2).text(),$(this).parent().parent().find('td').eq(3).text(),$(this).parent().parent().find('td').eq(4).text(),$(this).parent().parent().find('td').eq(5).text()];
            that.setMemberAuthority(memberValue,target);
          });

          // that.changePagination(target);
      };
      $('#slideMenu li').eq(0).click();

      // 修改用户
      $('.member-action #editMember').off('click').on('click',function(){
          // $('#newMemberModal').modal({'backdrop':'static'});
          var selectLength = $('#memberTable tbody tr input:checked').length;
          if(!selectLength){
            that.tips('请选择一条记录');
            return;
          }else if(selectLength>1){
            that.tips('最多只能选择一条记录');
            return;
          }
         // $('#newMemberModal').modal({'backdrop':'static'});
         var memberTr = $('#memberTable tr input:checked').parents('tr');
         // console.log(memberTr);
         var memberValue = [memberTr.find('td').eq(1).text(),memberTr.find('td').eq(2).text(),memberTr.find('td').eq(3).text(),memberTr.find('td').eq(4).text(),memberTr.find('td').eq(5).text()];
         // console.log(memberValue);
         that.updateMemberInfo(memberValue);
      });

      // 用户管理分配角色
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
         that.setMemberAuthority(memberTr);
      });


       // 用户角色分配穿梭框
       $('#giveCharacterModal .areaList li').off('click').on('click',function(){
         $(this).siblings().removeClass('active');
         $(this).addClass('active');
       });
       var choiceSet = function(){
         $('#giveCharacterModal #notSet li .fa-plus').off('click').on('click',function(){
            var nodeClone = $(this).parent().clone();
            nodeClone.removeClass('active').find('.fa-plus').removeClass('fa-plus').addClass('fa-minus');
            $(this).parent().remove();
            // console.log(nodeClone);
            $('#giveCharacterModal #seted').append(nodeClone);
            $('.choice .search .count').text($('#giveCharacterModal #notSet li').length+$('#giveCharacterModal #seted li').length+'/'+$('#giveCharacterModal #seted li').length);
            choiceSet();
            choiceNotSet();
         });
       };
       var choiceNotSet = function(){
         $('#giveCharacterModal #seted li .fa-minus').off('click').on('click',function(){
            var nodeClone = $(this).parent().clone();
            nodeClone.removeClass('active').find('.fa-minus').removeClass('fa-minus').addClass('fa-plus');
            $(this).parent().remove();
            $('#giveCharacterModal #notSet').append(nodeClone);
            $('.choice .search .count').text($('#giveCharacterModal #notSet li').length+$('#giveCharacterModal #seted li').length+'/'+$('#giveCharacterModal #seted li').length);
            choiceSet();
            choiceNotSet();
         });
       };
       choiceSet();
       choiceNotSet();
       // 角色分配模糊匹配
       $('.choice #search').off('keyup').on('keyup',function(){
          var cacheData = $(this).val();
          for(var i in $('#giveCharacterModal #notSet li')){
            if($('#giveCharacterModal #notSet li').eq(i).text().indexOf(cacheData)==-1){
              $('#giveCharacterModal #notSet li').eq(i).addClass('hidden');
            }else{
              $('#giveCharacterModal #notSet li').eq(i).removeClass('hidden');
            }
          }
       });

       // 角色管理页面
       // 新增角色
      $('.character-action #addCharacter').off('click').on('click',function(){
         $('#newCharacterModal .modal-title').html('新增角色');
         $('#newCharacterModal').modal({'backdrop':'static'});
      });

       // 权限管理页面
       // 新增权限
      $('.authority-action #addAuthority').off('click').on('click',function(){
         $('#newAuthorityModal .modal-title').html('新增权限');
         $('#newAuthorityModal').modal({'backdrop':'static'});
      });



    },
    initPageAction_tree:function(){

      $('.tree-container').off('mouseout').on('mouseover',function(event) {
        $('#foldTree').addClass('hidden');
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
    uploadFileReturnData:function(nextFunction){
        /*
        *上传文件处理函数
        *@param{function} nextFunction 上传文件成功后执行的函数
        */
    },
    loadMember:function(memberArray,ifEmpty){
        var that = this;
        // 加载管理员信息
        $('#memberTable thead input:checkbox').prop('checked',false);
        if(ifEmpty){
          $('#memberTable tbody').empty();
        }
        var memberArray = [
          ['张飞','123456789','四川省成都市','超级管理员','增加删除','这个管理员很少上线'],
          ['吕布','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['关羽','123456789','云南省昆明市','管理员','增加删除','这个管理员很少上线'],
          ['刘备','123456789','四川省广元市','普通用户','增加删除','这个管理员很少上线'],
          ['吕布','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['诸葛武侯','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['吕布','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['司马懿','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['新浪','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['人人','123456789','上海市','管理员','增加删除','这个管理员很少上线'],
          ['貂蝉','123456789','西藏自治区','超级管理员','增加删除','这个管理员很少上线']];
        for(var i in memberArray){
            if(i>9){break;}
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><input type="checkbox" name=""></th><td>'+that.setFirstZero((parseInt(i)+1))+'</td><td>'+memberArray[i][0]+'</td><td>'+memberArray[i][1]+'</td><td>'+memberArray[i][2]+'</td><td>'+memberArray[i][3]+'</td><td>'+memberArray[i][4]+'</td><td>'+memberArray[i][5]+'</td><td><a href="javascript:void(0)" class="action update" "email me">修改</a><a href="javascript:void(0)" class="action toGiveCharacter" "email me">分配角色</a><a href="javascript:void(0)" class="action delete" "email me">删除</a></td></tr>';
            $('#memberTable tbody').append(element);
        }
        that.updateTableBottomInfo($('#content #member'));
        that.initPagination($('#content #member'),6);
    },
    loadCharacter:function(characterArray,ifEmpty){
        var that = this;
        // 加载角色列表
        $('#characterTable thead input:checkbox').prop('checked',false);
        if(ifEmpty){
          $('#characterTable tbody').empty();
        }
        var characterArray = [
          ['红牌楼','道路障碍','路面损毁','一周检查一次'],
          ['高升桥','云南省昆明市','管理员','一周检查两次'],
          ['茶店子','道路障碍','路面损毁','这个管理员很少上线'],
          ['成都东站','上海市','管理员','一周检查一次'],
          ['高升桥','道路障碍','路面损毁','一周检查两次']];
        for(var i in characterArray){
            if(i>9){break;}
            // var element = '<tr id="userCheckbox'+i+'"><th scope="row"><input type="checkbox" name="" ></th><td>'+that.setFirstZero((parseInt(i)+1))+'</td><td>'+characterArray[i][0]+'</td><td>'+characterArray[i][1]+'</td><td>'+characterArray[i][2]+'</td><td>'+characterArray[i][3]+'</td><td>'+characterArray[i][4]+'</td><td><a href="javascript:void(0)" class="action edit" "email me">修改</a><a href="javascript:void(0)" class="action toGivePower" "email me">分配权限</a><a href="javascript:void(0)" class="action delete" "email me">删除</a></td></tr>';
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><input type="checkbox" name=""></th><td>'+characterArray[i][0]+'</td><td>'+characterArray[i][1]+'</td><td>'+characterArray[i][2]+'</td><td>'+characterArray[i][3]+'</td><td><a href="javascript:void(0)" class="action update" "email me">修改</a><a href="javascript:void(0)" class="action toGivePower" "email me">分配权限</a><a href="javascript:void(0)" class="action delete" "email me">删除</a></td></tr>';
              $('#characterTable tbody').append(element);
        }
        that.updateTableBottomInfo($('#content #character'));
        that.initPagination($('#content #character'),7);

    },
    loadAuthority:function(authorityArray,ifEmpty){
        var that = this;
        // 加载权限列表
        $('#authorityTable thead input:checkbox').prop('checked',false);
        if(ifEmpty){
          $('#authorityTable tbody').empty();
        }
        var authorityArray = [
            ['红牌楼','道路障碍','路面损毁','是','一周检查一次'],
            ['高升桥','云南省昆明市','管理员','是','一周检查两次'],
            ['茶店子','道路障碍','路面损毁','是','这个管理员很少上线'],
            ['成都东站','上海市','管理员','是','一周检查一次'],
            ['高升桥','道路障碍','路面损毁','是','一周检查两次']];
        for(var i in authorityArray){
            if(i>9){break;}
            var element = '<tr id="userCheckbox'+i+'"><th scope="row"><input type="checkbox" name=""></th><td>'+that.setFirstZero((parseInt(i)+1))+'</td><td>'+authorityArray[i][0]+'</td><td>'+authorityArray[i][1]+'</td><td>'+authorityArray[i][2]+'</td><td>'+authorityArray[i][3]+'</td><td><a href="javascript:void(0)" class="action update" "email me">修改</a><a href="javascript:void(0)" class="action delete" "email me">删除</a></td></tr>';
            $('#authorityTable tbody').append(element);
        }
            that.updateTableBottomInfo($('#content #authority'));
            that.initPagination($('#content #authority'),100,7);
    },
    loadMemberTree:function(data){
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
    loadCharacterTree:function(data){
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
    loadAuthorityTree:function(data){

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
    initPagination:function(target,totalPage,pageCount){
      var that = this;
      // var this.initPagination.prototype = initPagination;
      totalPage -= 1;
      pageCount = (pageCount)?(pageCount):(6);
      var matchPagination = target.find('.pagination').eq(0);
      // 先清空原有页码，再添加新的
      matchPagination.empty();
      if(totalPage<pageCount-1){
        pageCount = totalPage+1;
      }
      // 当翻页后，上一页按钮的操作
      this.initPagination.initPrePageCount = function(prePage_import){
            var prePage = '';
            // console.log(prePage_import);
            if(!prePage_import){
              prePage = parseInt(target.find('.page-num.page-change').first().prop('id').replace(/page-num-/,''));
            }else{
              prePage = prePage_import;
            }
            console.log(prePage,pageCount);

            var pageCountClone2 = pageCount;
            if(totalPage-prePage+2>=pageCount){
                target.find('#page-num-more').show();
                // pageCountClone2 = pageCount
            }else{
              pageCountClone2 -= 1;
              target.find('#page-num-more').hide();
            }

            target.find('.page-num.page-change').remove();

            if(prePage<=(pageCount+1)){
              prePage = pageCount + 1;
              target.find('#page-num-morePre').hide();
            }else{
              target.find('#page-num-morePre').show();
            }

            console.log(prePage,pageCount);
            for(var i = prePage;i>2;i--){
              if(i==prePage-pageCountClone2){
                break;
              }
              var len_2 ='<li class="page-item page-num page-change page-tool" id="page-num-'+(i-1)+'"><a class="page-link" href="#">'+(i-1)+'</a></li>';
                matchPagination.find('#page-num-morePre').after(len_2);
            };

            target.find('.pagination li.active').removeClass('active');

            that.changePagination(target,totalPage,1,'');
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
        // console.log(nextPage,totalPage,pageCount);
        if(nextPage>=totalPage-pageCount){
          target.find('#page-num-more').hide();
          if(totalPage<=pageCount){
              // target.find('#page-num-more').hide();
            nextPage = ((totalPage+1)-pageCount)?(totalPage-pageCount):(1);
          }else{
            // target.find('#page-num-more').show();
            nextPage = totalPage - pageCount + 1;
          }
        }else{
          target.find('#page-num-more').show();
        }

        var pageCountClone = pageCount;
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

        that.changePagination(target,totalPage,'',totalPage+1);
        if(nextPage_import){
          target.find('.pagination li#page-num-'+nextPage_import).addClass('active');
        }else{
          // target.find('.pagination li.page-num.page-change').first().addClass('active');
          target.find('.pagination li.page-num.page-change').first().click();
        }
        // target.find('.pagination li.page-num').first().click();
      };


      // 插入上一页
      matchPagination.append('<li class="page-item page-change page-tool previousPage"><a class="page-link" href="#" aria-label="Previous" title="上一页"><span aria-hidden="true">&laquo;</span><span class="sr-only">Previous</span></a></li><li class="page-item page-tool page-num" id="page-num-1"><a class="page-link" href="#">'+1+'</a></li>');
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
      matchPagination.append('<li class="page-item page-tool page-num" id="page-num-'+(totalPage+1)+'"><a class="page-link" href="#">'+(totalPage+1)+'</a></li><li class="page-item page-change page-tool nextPage" title="下一页"><a class="page-link" href="#" aria-label="Next"><span aria-hidden="true">&raquo;</span><span class="sr-only">Next</span></a></li>');

      /*target.find('#page-num-1').off('click').on('click',function(){
        initNextPageCount(1);
      });
      target.find('#page-num-'+(totalPage+1)).off('click').on('click',function(){
        initPrePageCount(totalPage+1);
      });*/

      target.find('.pagination li.active').removeClass('active');
      target.find('.pagination li.page-num').first().addClass('active');
      that.changePagination(target,totalPage+1);

    },
    changePagination:function(target,totalPage,pageRangeMin,pageRangeMax){
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

        if($(this).prop('id')=="page-num-1"){
          that.initPagination.initNextPageCount(1);
        }else if($(this).prop('id')=='page-num-'+totalPage){
          that.initPagination.initPrePageCount(totalPage);
        }
      // console.log(oldPage,changedPage,pageRangeMin,pageRangeMax);
// 理论是这样，可能即便这样软件也生成不了，不过这个理论都不成立，所以就没的说了
        // 此处请求服务器翻页数据
      fetch(requestURL.changedPage+'?changedPage='+changedPage).then(res=>res.json()).then(data=>{
          console.log(data);
        }).catch(error=>{
          // console.log($('#page-num-'+changedPage));
          that.tips('网络出错');
          target.find('.pagination li.active').removeClass('active');
          target.find('#page-num-'+changedPage).addClass('active');
          // target.find('.pagination li.active').siblings().removeClass('active');
        });

      });
      // target.find('.pagination li.active').click();
    },
    setFirstZero:function(num){
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
    tips:function(msg,delay){
        /*
        * 消息通知
        * @param{string，number} msg 显示的信息  delay显示时间
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
    confirms:function(msg,yes,no){
        /*
        * 消息通知
        * @param{msg，yes,no} msg，{title，info}显示的标题与显示内容，yes与no为选择后执行的函数
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



