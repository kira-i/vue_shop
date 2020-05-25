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
                <el-table-column type="expand">
                    <!--使用作用域插槽获取当前对象-->
                    <template slot-scope="scope">
                        <!--一级权限-->
                        <el-row :class="['bdbottom', i1 === 0 ? 'bdtop' : '', 'vcenter']" v-for="(item1,i1) in scope.row.children" :key="item1.id">
                            <el-col :span="5">
                                <el-tag closable @close="removeRightById(scope.row,item1.id)">
                                    {{item1.authName}}
                                </el-tag>
                                <i class="el-icon-caret-right"></i>
                            </el-col>
                            <!--二级权限和三级权限-->
                            <el-col :span="19">
                                <el-row :class="[i2 === 0 ? '' : 'bdtop', 'vcenter']" v-for="(item2,i2) in item1.children" :key="item2.id">
                                    <!--渲染二级权限-->
                                    <el-col :span="6">
                                        <el-tag type="success" closable @close="removeRightById(scope.row,item2.id)">{{item2.authName}}</el-tag>
                                        <i class="el-icon-caret-right"></i>
                                    </el-col>
                                    <el-col :span="18">
                                        <el-tag v-for="(item3,i3) in item2.children" :key="item3.id" closable @close="removeRightById(scope.row,item3.id)">
                                            {{item3.authName}}
                                        </el-tag>
                                    </el-col>
                                </el-row>
                            </el-col>
                        </el-row>
                    </template>
                </el-table-column>
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
                            <el-button type="warning" icon="el-icon-star-off" circle @click="showSetRightDialog(scope.row)"></el-button>
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

        <!--分配权限对话框-->
        <el-dialog
                title="分配权限"
                :visible.sync="setRightDialogVisible"
                width="50%"
                @close="setRightDialogClosed"
                >
            <el-tree :data="treeRightsList" :props="defaultTreeProps" node-key="id" show-checkbox default-expand-all
                     :default-checked-keys="defKeys" ref="treeRef"></el-tree>
            <span slot="footer" class="dialog-footer">
                <el-button @click="setRightDialogVisible = false">取 消</el-button>
                <el-button type="primary" @click="allotRights">确 定</el-button>
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
                setRightDialogVisible:false,
                addRoleForm:{},

                /*权限初始化对象*/
                treeRightsList:[],
                defaultTreeProps:{
                    children: 'children',
                    label: 'authName'
                },
                /*默认选中id节点的值*/
                defKeys:[],
                /*角色id*/
                roleId:'',

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
            this.getRolesList()
        },

        methods: {
            async getRolesList() {
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
                    this.getRolesList()
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
                    this.getRolesList()
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
                this.getRolesList()
            },
            /*根据id删除该角色对应的权限*/
            async removeRightById(role,rightId){
                const confirmResult = await this.$confirm(
                    '此操作将永久删除改权限,是否继续?','提示',{
                    confirmButtonText:'确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).catch(err =>err)
                if(confirmResult !== 'confirm'){return this.$message.info('已取消删除')}
                const {data:res} = await this.$http.delete( `roles/${role.id}/rights/${rightId}`)
                if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                role.children = res.data
                this.$message.success('删除权限成功')

            },
            /*弹出分配权限对话框*/
            async showSetRightDialog(role){
                this.roleId = role.id
                const {data:res} = await this.$http.get('rights/tree')
                if(res.meta.status !== 200){return this.$message.error(res.meta.msg)}
                this.treeRightsList = res.data
                console.log(res)
                this.getLeafkeys(role,this.defKeys)
                this.setRightDialogVisible = true
            },
            /*递归遍历出最下级权限的id*/
            getLeafkeys(node,arr){
                /*判断是否存在子集*/
                if(!node.children){
                    return arr.push(node.id)
                }
                /*存在子集children,继续调用递归方法遍历*/
                node.children.forEach(item => this.getLeafkeys(item,arr))
            },
            /*监听添加权限对话框关闭事件*/
            setRightDialogClosed(){
                this.defKeys = []
            },
            /*为角色添加权限*/
            async allotRights(roleId){
                const keys = [
                    ...this.$refs.treeRef.getCheckedKeys(),
                    ...this.$refs.treeRef.getHalfCheckedKeys()
                ]
                const idStr = keys.join(',')
                const {data:res} = await this.$http.post(`roles/${this.roleId}/rights`, { rids: idStr })
                if(res.meta.status !== 200){ return this.$message.error(res.meta.msg)}
                this.$message.success(res.meta.msg)
                this.getRolesList()
                this.setRightDialogVisible = false
            }
        }

    }
</script>


<style lang="less">
    .el-tag {
        margin: 7px;
    }
    .bdtop {
        border-top: 1px solid #eee;
    }
    .bdbottom {
        border-bottom: 1px solid #eee;
    }
    .vcenter {
        display: flex;
        align-items: center;
    }
</style>