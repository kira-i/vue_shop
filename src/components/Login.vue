<template>
    <div class="login_container">
        <div class="login_box">
            <!--登录头像框-->
            <div class="avatar_box">
                <img src="../assets/lgoin_logo.png" width="100px" height="100px" alt="">
            </div>
            <!--登录表单框-->
            <el-form :model="loginForm" :rules="loginFormRules" ref="loginFormRef" label-width="70px"
                     class="login_from">
                <el-form-item label="用户名" prop="username">
                    <el-input v-model="loginForm.username">
                        <i slot="prefix" class="el-icon-user"></i>
                    </el-input>
                </el-form-item>

                <el-form-item label="密码" prop="password">
                    <el-input v-model="loginForm.password" type="password">
                        <i slot="prefix" class="el-icon-lock"></i>
                    </el-input>
                </el-form-item>
                <!--按钮区域-->
                <el-form-item class="btns">
                    <el-button type="primary" @click="login">登录</el-button>
                    <el-button type="info" @click="resetLoginForm">重置</el-button>
                </el-form-item>
            </el-form>


        </div>
    </div>
</template>
<script>
    export default {
        data() {
            return {
                loginForm: {
                    username: 'admin',
                    password: '123456'
                },
                loginFormRules: {
                    username: [
                        {required: true, message: '请输入用户名', trigger: 'blur'}
                    ],
                    password: [
                        {required: true, message: '请输入密码', trigger: 'blur'}
                    ]
                }

            }
        },
        methods: {
            //点击重置按钮,重置登录表单
            resetLoginForm() {
                /*console.log(this);*/
                this.$refs.loginFormRef.resetFields();
            },
            //表单登录预校验
            login() {
                this.$refs.loginFormRef.validate(async valid => {
                    if (!valid) return;
                    const {data: ref} = await this.$http.post("login", this.loginForm);
                    if (ref.meta.status !== 200) {
                        return this.$message.error("登录失败")
                    }
                    this.$message.success("登录成功")
                    window.sessionStorage.setItem('token',ref.data.token)
                    this.$router.push('/home')

                })
            }
        }
    };
</script>

<style lang="less">
    .login_container {
        background-color: aquamarine;
        height: 100%;
    }

    .login_box {
        height: 300px;
        width: 500px;
        background-color: white;
        border-radius: 3px;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);

    .avatar_box {
        width: 100px;
        height: 100px;
        border: 1px solid #eee;
        border-radius: 50%;
        padding: 10px;
        box-shadow: 0 0 10px #ddd;
        position: absolute;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #fff;

    img {
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background-color: pink;
    }

    }
    }
    .btns {
        display: flex;
        justify-content: flex-end;
    }

    .login_from {
        position: absolute;
        bottom: 0;
        width: 100%;
        padding: 0 20px;
        box-sizing: border-box;
    }


</style>

