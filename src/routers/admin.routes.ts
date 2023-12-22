import { Router} from "express"
import { adminControllerV1 } from "../controller/adminController"
import { adminSessionCheck } from "../middleware/adminJwt"
import { sessionCheckv1 } from "../middleware/jwtVerification"

class adminRouter {
    private router!:Router
    constructor(){
        this.router = Router()
    }
    adminrouter(){
        this.router.get('/home' , adminControllerV1.home)
        this.router.post('/login' , adminControllerV1.login)
        this.router.post('/otp-verify',adminControllerV1.otpVerify)
        this.router.patch('/logout',adminSessionCheck.tokenVerification,adminControllerV1.logout)
        this.router.post('/forgot-password',adminControllerV1.forgetPassword)
        this.router.post('/reset-password',adminControllerV1.setNewPass)
        this.router.get('/get-all-user',adminControllerV1.getAllUser )
        this.router.post('/remove-user', adminControllerV1.removeUser)

        return this.router
    }
}

export const adminRouterV1 = new adminRouter()