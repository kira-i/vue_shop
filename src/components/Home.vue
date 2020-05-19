<template>

    <el-container>
        <!--头部区域-->
        <el-header>
            <div>
                <img src="../assets/321962.png" height="70px" width="70px" alt="" class="app-img">
                <span>
                    vue_shop管理平台
                </span>
            </div>
            <el-button type="info" @click="logout">
                退出
            </el-button>
        </el-header>
        <el-container>
            <!--左侧边栏-->
            <el-aside :width="isCollapse ? '64px' : '200px'">
                <div class="toggle-button" @click="toggleCollapse">|||</div>
                <el-menu
                        background-color="#333744"
                        text-color="#fff"
                        active-text-color="#409FFF"
                        :unique-opened="true"
                        :collapse="isCollapse"
                        :collapse-transition="false"
                        :router="true"
                        :default-active="activePathList">
                    <!--一级菜单-->
                    <el-submenu :index="item.id+''" v-for="item in menuList" :key="item.id">
                        <template slot="title">
                            <i :class="iconObj[item.id]"></i>
                            <span>{{item.authName}}</span>
                        </template>

                        <!--二级菜单-->
                        <el-menu-item :index="'/' + subItem.path" v-for="subItem in item.children" :key="subItem.id"
                                      @click="saveNavState('/' + subItem.path)">
                            <template slot="title">
                                <i class="el-icon-menu"></i>
                                <span>{{subItem.authName}}</span>
                            </template>
                        </el-menu-item>

                    </el-submenu>
                </el-menu>
            </el-aside>
            <!--主体区域-->
            <el-main>
                <router-view></router-view>
            </el-main>
        </el-container>
    </el-container>

</template>

<script>
    export default {
        data() {
            return {
                /*左侧菜单栏数据*/
                menuList: [],
                iconObj: {
                    '125': 'el-icon-user-solid',
                    '103': 'el-icon-s-help',
                    '101': 'el-icon-s-goods',
                    '102': 'el-icon-s-order',
                    '145': 'el-icon-s-platform'
                },
                //收缩栏按钮.默认不重叠
                isCollapse: false,
                activePathList: ''
            }
        },
        created() {
            this.getMenuList()
            this.activePathList = window.sessionStorage.getItem('activePath')
        },
        methods: {
            logout() {
                window.sessionStorage.clear()
                this.$router.push('/login')
            },
            async getMenuList() {
                const {data: res} = await this.$http.get('menus')
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.menuList = res.data
                console.log(res)
            },
            toggleCollapse() {
                this.isCollapse = !this.isCollapse
            },
            saveNavState(activePath) {
                window.sessionStorage.setItem('activePath', activePath)
                this.activePathList = activePath
            }
        }

    }
</script>

<style lang="less">


    .el-header {
        background-color: #373f41;
        display: flex;
        justify-content: space-between;
        padding-left: 0;
        align-items: center;
        color: #fff;
        font-size: 20px;

    > div {
        display: flex;
        align-items: center;

    img {
        height: 40px;
    }

    span {
        margin-left: 15px;
    }

    }
    }
    .el-aside {
        background-color: #333744;

    .el-menu {
        border: none;
    }

    }

    .el-main {
        background-color: white;
    }

    .el-container {
        height: 100%;
    }

    .iconfont {
        margin-right: 10px;
    }

    .toggle-button {
        background-color: #4A5064;
        color: white;
        text-align: center;
        font-size: 10px;
        line-height: 24px;
        letter-spacing: 0.2em;
        cursor: pointer;
    }

</style>