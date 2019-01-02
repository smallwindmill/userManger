var requestServer = 'http://192.168.0.129:8080/CDTGIS';

var requestUser = requestServer+'/sysuser'; //人员
var requestSystem = requestServer+'/system';//系统
var requestSystemRole = requestServer+'/systemRole';//系统角色
var requestSystemPower = requestServer+'/systemPower';//系统权限

var requestURL = {
    /*用户管理*/
    login:requestUser+'/login',                          // 登陆
    getUserByID:requestUser+'/getUserByID',              // 查询单个用户
    getUsers:requestUser+'/getUsers',                    // 查询所有用户
    getUsersByKeyWord:requestUser+'/getUsersByKeyWord',  // 关键字查询用户
    addUser:requestUser+'/addUser',                             //添加用户
    delUser:requestUser+'/delUser',                             //删除用户
    updUser:requestUser+'/updUser',                             //更新用户
    updPassword:requestUser+'/updPassword',                     //更新密码
    restPassword:requestUser+'/restPassword',                   //重置密码

    /*系统管理*/
    addSystem:requestSystem+'/add',                             //添加系统
    delSystem:requestSystem+'/delete',                          //删除系统
    updSystem:requestSystem+'/update',                          //更新系统
    querySystem:requestSystem+'/query',                       //查询

    /*角色管理*/
    addRole:requestSystemRole+'/addRole',                             //添加角色
    delRole:requestSystemRole+'/delRole',                             //删除角色
    updRole:requestSystemRole+'/updRole',                             //更新角色
    queryRole:requestSystemRole+'/query',                             //查询

    /*权限管理*/
    addPower:requestSystemPower+'/addPower',                             //添加权限
    delPower:requestSystemPower+'/delPower',                             //删除权限
    updPower:requestSystemPower+'/updPower',                             //更新权限
    queryPower:requestSystemPower+'/query',                             //查询
    grantUsers:requestSystemPower+'/grantUsers'                         //分配用户
    grantPowers:requestSystemPower+'/grantPowers'                       //分配权限
}
