<template>
    <div>
        <!--面包屑导航-->
        <el-breadcrumb separator-class="el-icon-arrow-right">
            <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
            <el-breadcrumb-item>权限管理</el-breadcrumb-item>
            <el-breadcrumb-item>角色列表</el-breadcrumb-item>
        </el-breadcrumb>

        <!--卡片区域-->
        <el-card>

            <el-button type="primary" @click="addRoleDialog">添加角色</el-button>

            <el-table :data="rightsList" style="width: 100%" stripe border>
                <el-table-column type="index" label="#"></el-table-column>
                <el-table-column prop="roleName" label="角色名称"></el-table-column>
                <el-table-column prop="roleDesc" label="角色描述"></el-table-column>
                <el-table-column label="操作">
                    <template slot-scope="scope">
                        <!--编辑按钮 并开启Tooltip提醒-->
                        <el-tooltip class="item" effect="dark" content="编辑角色" placement="top" :enterable="false">
                            <el-button type="primary" icon="el-icon-edit" circle @click="editRoleFromList(scope.row.id)"></el-button>
                        </el-tooltip>

                        <!--删除按钮 并开启Tooltip提醒-->
                        <el-tooltip class="item" effect="dark" content="删除角色" placement="top" :enterable="false">
                            <el-button type="danger" icon="el-icon-delete" circle @click="deleteRoleById(scope.row.id)"></el-button>
                        </el-tooltip>

                        <!--分配按钮 并开启Tooltip提醒-->
                        <el-tooltip class="item" effect="dark" content="分配权限" placement="top" :enterable="false">
                            <el-button type="warning" icon="el-icon-star-off" circle></el-button>
                        </el-tooltip>

                    </template>
                </el-table-column>
            </el-table>
        </el-card>

        <!--添加角色-->
        <el-dialog
                title="修改角色"
                :visible.sync="addDialogVisibleRole"
                width="50%"
                @close="roleAddCloseDialog">
            <span>
                <el-form ref="addRoleRef" :model="addRoleForm" :rules="addRoleRules" label-width="80px">
                  <el-form-item label="角色名称" prop="roleName">
                      <el-input v-model="addRoleForm.roleName"></el-input>
                  </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                      <el-input v-model="addRoleForm.roleDesc"></el-input>
                  </el-form-item>

                </el-form>
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="addDialogVisibleRole = false">取 消</el-button>
                <el-button type="primary" @click="addRoleInfo">确 定</el-button>
            </span>
        </el-dialog>

        <!--编辑角色-->
        <el-dialog
                title="编辑角色"
                :visible.sync="editDialogVisibleRole"
                width="50%"
                @close="roleEditCloseDialog">
            <span>
                <el-form ref="editRoleRef" :model="editRoleForm" :rules="editRoleRules" label-width="80px">
                  <el-form-item label="角色名称" prop="roleName">
                      <el-input v-model="editRoleForm.roleName"></el-input>
                  </el-form-item>
                    <el-form-item label="角色描述" prop="roleDesc">
                      <el-input v-model="editRoleForm.roleDesc"></el-input>
                  </el-form-item>

                </el-form>
            </span>
            <span slot="footer" class="dialog-footer">
                <el-button @click="editDialogVisibleRole = false">取 消</el-button>
                <el-button type="primary" @click="editRoles">确 定</el-button>
            </span>
        </el-dialog>

    </div>
</template>

<script>
    export default {
        data() {
            return {
                rightsList: [],
                addDialogVisibleRole:false,
                editDialogVisibleRole:false,
                addRoleForm:{},

                /*添加角色表单输入框校验规则*/
                editRoleRules: {
                    roleName: [
                        {required: true, message: '请输入角色名', trigger: 'blur'}
                    ],
                    roleDesc: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'}
                    ]
                },

                editRoleForm:{},
                /*编辑角色输入框校验规则*/
                addRoleRules: {
                    roleName: [
                        {required: true, message: '请输入角色名', trigger: 'blur'}
                    ],
                    roleDesc: [
                        {required: true, message: '请输入角色描述', trigger: 'blur'}
                    ]
                }
            }
        },

        created() {
            this.getRightsList()
        },

        methods: {
            async getRightsList() {
                const {data: res} = await this.$http.get('roles')
                this.rightsList = res.data
                /*console.log(res)*/
            },
            addRoleDialog(){
                this.addDialogVisibleRole = true
            },
            /*重置添加框内容*/
            roleAddCloseDialog(){
                this.$refs.addRoleRef.resetFields();
            },
            /*重置编辑框内容*/
            roleEditCloseDialog(){
                this.$refs.editRoleRef.resetFields();
            },
            /*添加角色,首先进行输入框预校验,为true则调用api接口添加数据*/
            addRoleInfo(){
                this.$refs.addRoleRef.validate(async valid => {
                    if(!valid){ return }
                    const {data:res} = await this.$http.post('roles',this.addRoleForm)
                    if(res.meta.status !== 201){ return this.$message.error(res.meta.msg) }
                    this.$message.success(res.meta.msg)
                    this.addDialogVisibleRole = false
                    this.getRightsList()
                })

            },
            editRoleDialog(){
                this.addDialogVisibleRole = true
            },
            /*根据当前角色id获取当前角色信息*/
            async editRoleFromList(id){
                this.editDialogVisibleRole = true
                const {data:res} = await this.$http.get('roles/'+id)
                if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                this.editRoleForm =res.data
                /*console.log(res.data)*/
            },
            /*修改当前角色信息*/
            editRoles(){
                this.$refs.editRoleRef.validate(async valid => {
                    if(!valid){ return }
                    const {data:res} = await this.$http.put('roles/'+this.editRoleForm.roleId,
                        {roleName:this.editRoleForm.roleName,
                        roleDesc:this.editRoleForm.roleDesc}
                        )
                    if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                    this.$message.success('修改角色成功')
                    this.editDialogVisibleRole = false
                    this.getRightsList()
                })
            },
            /*删除角色信息*/
            async deleteRoleById(id){
                const confirmResult = await this.$confirm(
                    '此操作将永久删除该角色, 是否继续?',
                    '提示',
                    {
                        confirmButtonText: '确定',
                        cancelButtonText: '取消',
                        type: 'warning'
                    }
                ).catch(err => err)
                if(confirmResult !== 'confirm'){ return this.$message.error('已取消删除')}
                const {data:res} = await this.$http.delete('roles/'+id)
                if(res.meta.status !== 200){ return this.$message.error(res.meta.msg) }
                this.$message.success(res.meta.msg)
                this.getRightsList()
            }
        }

    }
</script>


<style>

</style>