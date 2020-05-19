<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>用户管理</el-breadcrumb-item>
            <el-breadcrumb-item>用户列表</el-breadcrumb-item>
        </el-breadcrumb>
        <!--卡片视图-->
        <el-card>
            <!--搜索区域-->
            <el-row :gutter="20">
                <el-col :span="7">
                    <el-input placeholder="请输入内容" v-model="queryInfo.query" clearable @clear="getUsersList">
                        <el-button slot="append" icon="el-icon-search" @click="getUsersList"></el-button>
                    </el-input>
                </el-col>
                <el-col :span="4">
                    <el-button type="primary" @click="addDialogVisible=true">添加用户</el-button>
                </el-col>
            </el-row>

            <!--用户信息展示区域-->
            <el-table :data="userList" :border="true" :stripe="true">
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="username" label="姓名"></el-table-column>
                <el-table-column prop="email" label="邮箱"></el-table-column>
                <el-table-column prop="mobile" label="电话"></el-table-column>
                <el-table-column prop="role_name" label="角色"></el-table-column>
                <el-table-column label="状态">
                    <!--作用域插槽-->
                    <template slot-scope="scope">
                        <el-switch
                                v-model="scope.row.mg_state" @change="userStateChanged(scope.row)">
                        </el-switch>
                    </template>
                </el-table-column>
                <el-table-column label="操作" width="160px">
                    <template slot-scope="scope">
                        <el-tooltip effect="dark" content="修改" placement="top" :enterable="false">
                            <el-button @click="showDialogVisible(scope.row.id)" type="primary" icon="el-icon-edit" size="mini"
                                       :circle="true"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="删除" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" size="mini" :circle="true" @click="deleteUserFrom(scope.row.id)"></el-button>
                        </el-tooltip>
                        <el-tooltip effect="dark" content="分配角色" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-setting" size="mini" :circle="true"></el-button>
                        </el-tooltip>
                    </template>
                </el-table-column>
            </el-table>
            <!--分页功能-->
            <el-pagination
                    @size-change="handleSizeChange"
                    @current-change="handleCurrentChange"
                    :current-page="queryInfo.pagenum"
                    :page-sizes="[1, 2, 5, 10]"
                    :page-size="queryInfo.pagesize"
                    layout="total, sizes, prev, pager, next, jumper"
                    :total="total">
            </el-pagination>
        </el-card>

        <!--添加用户弹出框-->
        <el-dialog
                title="添加用户信息"
                :visible.sync="addDialogVisible"
                width="50%"
                @close="addDialogClose">
            <el-form :model="addUserForm" :rules="addUserRules" ref="ruleFormRef" label-width="70px">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="addUserForm.username"></el-input>
                </el-form-item>
                <el-form-item label="密码" prop="password">
                    <el-input v-model="addUserForm.password"></el-input>
                </el-form-item>
                <el-form-item label="邮箱" prop="email">
                    <el-input v-model="addUserForm.email"></el-input>
                </el-form-item>
                <el-form-item label="手机" prop="mobile">
                    <el-input v-model="addUserForm.mobile"></el-input>
                </el-form-item>
            </el-form>
            <span slot="footer" class="dialog-footer">
                    <el-button @click="addDialogVisible = false">取 消</el-button>
                    <el-button type="primary" @click="addUser">确 定</el-button>
                </span>
        </el-dialog>

        <!--弹出修改用户框-->
        <el-dialog
                title="提示"
                :visible.sync="editDialogVisible"
                width="50%"
                @close="editDialogClose">
            <span>
                <el-form :model="editUserForm" :rules="editUserRules" ref="editRuleFormRef" label-width="70px">
                    <el-form-item label="用户名" prop="username">
                        <!--用户名禁用-->
                <el-input v-model="editUserForm.username" disabled></el-input>
                    </el-form-item>
                    <el-form-item label="邮箱" prop="email">
                <el-input v-model="editUserForm.email"></el-input>
                    </el-form-item>
                    <el-form-item label="手机" prop="mobile">
                <el-input v-model="editUserForm.mobile"></el-input>
                    </el-form-item>
                </el-form>
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="editUser">确 定</el-button>
            </span>
        </el-dialog>
    </div>
</template>


<script>
    export default {
        data() {
            /*自定义邮箱校验规则*/
            var validateEmail = (rule, value, callback) => {
                const regEmail = /^\w+@\w+(\.\w+)+$/
                if (regEmail.test(value)) {
                    return callback()
                }
                callback(new Error('请输入正确的邮箱'))
            };
            /*自定义手机号校验规则*/
            var validateMobile = (rule, value, callback) => {
                const regMobile = /^1[34578]\d{9}$/
                if (regMobile.test(value)) {
                    return callback()
                }
                callback(new Error('请输入正确的手机号'))
            };
            return {
                /*获取用户列表参数*/
                queryInfo: {
                    query: '',
                    /*当前页数*/
                    pagenum: 1,
                    /*当前页显示的条数*/
                    pagesize: 5
                },
                /*用户列表数据*/
                userList: [],
                total: 0,
                addDialogVisible: false,
                editDialogVisible: false,
                addUserForm: {
                    username: '',
                    password: '',
                    email: '',
                    mobile: ''
                },
                editUserForm: {
                },
                /*表单输入框校验规则*/
                addUserRules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ],
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: validateEmail, trigger: 'blur'}
                    ],
                    mobile: [
                        {required: true, message: '请输入手机号', trigger: 'blur'},
                        {validator: validateMobile, trigger: 'blur'}
                    ]
                },
                editUserRules: {
                    email: [
                        {required: true, message: '请输入邮箱', trigger: 'blur'},
                        {validator: validateEmail, trigger: 'blur'}
                    ],
                    mobile: [
                        {required: true, message: '请输入手机号', trigger: 'blur'},
                        {validator: validateMobile, trigger: 'blur'}
                    ]
                }
            }
        },
        created() {
            this.getUsersList()
        },
        methods: {
            /*调用接口,获取用户数据*/
            async getUsersList() {
                const {data: res} = await this.$http.get('users', {params: this.queryInfo})
                if (res.meta.status !== 200) return this.$message.error(res.meta.msg)
                this.userList = res.data.users
                this.total = res.data.total
                /*console.log(this.userList)
                console.log(this.total)*/
            },
            /*监听pageSize改变的数据*/
            handleSizeChange(newSize) {
                this.queryInfo.pagesize = newSize
                this.getUsersList()
                /*console.log(newSize)*/
            },
            /*监听 页码值 改变事件*/
            handleCurrentChange(newSize) {
                this.queryInfo.pagenum = newSize
                this.getUsersList()
            },
            /*监听switch开工,并修改数据库状态*/
            async userStateChanged(userInfo) {
                const {data: res} = await this.$http.put(`users/${userInfo.id}/state/${userInfo.mg_state}`)
                if (res.meta.status !== 200) {
                    userInfo.mg_state = !userInfo.mg_state
                    return this.$message.error(res.meta.msg)
                }
                this.$message.success(res.meta.msg)

            },
            /*添加用户框表单重置方法*/
            addDialogClose() {
                this.$refs.ruleFormRef.resetFields();
            },
            /*添加用户方法*/
            addUser() {
                this.$refs.ruleFormRef.validate(async valid => {
                    /*表单预校验为false,则直接返回*/
                    if (!valid) {
                        return
                    }
                    /*表单预校验为true,则调用添加用户接口*/
                    const {data: res} = await this.$http.post('users', this.addUserForm)
                    if (res.meta.status !== 201) {
                        return this.$message.error(res.meta.msg)
                    }
                    this.$message.success(res.meta.msg)
                    this.addDialogVisible = false
                    this.getUsersList()
                })
            },
            /*修改用户框表单重置方法*/
            editDialogClose() {
                this.$refs.editRuleFormRef.resetFields();
            },
            /*修改按钮,调用接口提交修改数据*/
            editUser() {
                this.$refs.editRuleFormRef.validate(async valid => {
                    /*valid为false,直接返回*/
                    if(!valid){
                        return
                    }
                    this.editDialogVisible = false
                    /*valid为true,访问后台接口*/
                    console.log(this.editUserForm.id)
                    const {data:res} = await this.$http.put('users/' + this.editUserForm.id,
                        {email:this.editUserForm.email,
                         mobile:this.editUserForm.mobile
                        })
                    if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                    this.$message.success(res.meta.msg)
                    this.getUsersList()

                })
            },
            async showDialogVisible(id){
                this.editDialogVisible = true
                /*console.log(id)*/
                const {data:res} = await this.$http.get('users/' + id)
                if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                this.editUserForm = res.data
                /*console.log(res)*/

            },
            async deleteUserFrom(id){
                const resdata = await this.$confirm('此操作将永久删除该用户, 是否继续?', '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err => err)
                if(resdata !== 'confirm'){return this.$message.info('用户删除已取消')}
                /*console.log(resdata)*/
                const {data:res} = await this.$http.delete('users/' + id)
                if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                this.$message.success(res.meta.msg)
                this.getUsersList()

            }
        }

    }
</script>

<style lang="less">


</style>