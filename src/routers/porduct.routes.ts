import { Router} from "express"
import { ProductControllerV1 } from "../controller/productController"
import { DeleteChat, addReactionToMessage, editChatMessage, findAddGroupMembers, getAllmsgs, getReviewerChatMessages, sendChatToReviewer, sendChatToUser , subscribeToReviewerChatMessages, unsubscribeFromTopic  } from "../mqtt/mqttChat";
import { adminSessionCheck } from "../middleware/adminJwt";
import { sessionCheckv1 } from "../middleware/jwtVerification";
import { unsubscribe } from "diagnostics_channel";
// import { mqttController } from "../controller/mqtt.controller";

class productRouter{
    private router!: Router;
    constructor(){
        this.router = Router()
    }
    productRouter(){
        this.router.post('/add-cart',sessionCheckv1.tokenVerification, ProductControllerV1.addCart)
        this.router.post('/remove-cart',sessionCheckv1.tokenVerification, ProductControllerV1.removeFromCart)
        this.router.get('/get-cart' , sessionCheckv1.tokenVerification,ProductControllerV1.viewMyCart)
        this.router.post('/place-order',sessionCheckv1.tokenVerification,ProductControllerV1.placeOrder)
        this.router.post('/cancel-order',sessionCheckv1.tokenVerification,ProductControllerV1.cancelOrder)
        this.router.get('get-order',ProductControllerV1.viewMyOrder)
        this.router.post('/addProduct' ,adminSessionCheck.tokenVerification, ProductControllerV1.AddProduct)
        this.router.patch('/editProduct' ,adminSessionCheck.tokenVerification, ProductControllerV1.EditProduct)
        this.router.delete('/deleteProduct',adminSessionCheck.tokenVerification , ProductControllerV1.DelteProduct)
        this.router.get('/get-product',ProductControllerV1.getProduct)
        this.router.post('/chat/reviewer',sessionCheckv1.tokenVerification , sendChatToReviewer)
        this.router.post('/add-review',sessionCheckv1.tokenVerification,  ProductControllerV1.Addreview)
        this.router.post('/chat/user/reply',sessionCheckv1.tokenVerification , sendChatToUser) 
        this.router.post('/subReview/:reviewId',sessionCheckv1.tokenVerification, subscribeToReviewerChatMessages ),
        this.router.get('/all-msgs/:reviewId' , getAllmsgs)
        this.router.get('/getmsg' , getReviewerChatMessages)
        this.router.post('/chat/reaction' ,sessionCheckv1.tokenVerification, addReactionToMessage) 
        this.router.put('/chat/edit', sessionCheckv1.tokenVerification , editChatMessage)
        this.router.post('/chat/delete' , sessionCheckv1.tokenVerification ,DeleteChat )
        this.router.post("/chat/unsubscribe/:reviewId" , sessionCheckv1.tokenVerification , unsubscribeFromTopic),
        this.router.get('/chat/members/:reviewId' , findAddGroupMembers)
        return this.router
    }
}

export const productRouterV1 = new productRouter()