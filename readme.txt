 Detailed documentation for APIs, including request and response details:

**Admin Service**

1. **Login**
   - Request:
     - Method: POST
     - Endpoint: `/admin/login`
     - Body:
       - Email (String)
       - Password (String)
   - Response:
     - If Email and Password are correct, an OTP will be generated for verification.

2. **Otp-verify**
   - Request:
     - Method: POST
     - Endpoint: `/admin/otp-verify`
     - Body:
       - Email (String)
       - OTP (String)
   - Response:
     - If OTP is correct, a session will be maintained, and a token will be generated.

3. **Logout**
   - Request:
     - Method: PATCH
     - Endpoint: `/admin/logout`
     - Headers:
       - Authorization Token
   - Response:
     - The session will be dismissed.

4. **Forgot-password**
   - Request:
     - Method: POST
     - Endpoint: `/admin/forgot-password`
     - Body:
       - Email (String)
   - Response:
     - If the user exists in the database, an email for verification will be sent.

5. **Reset-password**
   - Request:
     - Method: POST
     - Endpoint: `/admin/reset-password`
     - Body:
       - OTP (String)
       - Email (String)
       - NewPassword (String)
   - Response:
     - If OTP is correct, the old password will be reset to the new password.

6. **Get-all-user**
   - Request:
     - Method: GET
     - Endpoint: `/admin/get-all-users`
   - Response:
     - List of all user data.

7. **Remove-User**
   - Request:
     - Method: DELETE
     - Endpoint: `/admin/remove-user/`
   - Response:
     - User will be removed.

**User Service**

1. **Home**
   - Request:
     - Method: GET
     - Endpoint: `/user/home`
   - Response:
     -Check weather the website is resposive or not.

2. **Signup**
   - Request:
     - Method: POST
     - Endpoint: `/user/signup`
     - Body:
        - username (string)
       - Email (String)
       - Password (String)
       - Name (String)
       - mobile (Number)
   - Response:
     - If successful, the User data get stored is redis and otp is genrated 

3. **Verify-new-user**
   - Request:
     - Method: POST
     - Endpoint: `/user/verify-new-user`
     - Body:
       - OTP (String)
   - Response:
     - If OTP is correct, the user will be verified and Data will be stored in the db.

4. **Logout**
   - Request:
     - Method: PATCH
     - Endpoint: `/user/logout`
     - Headers:
       - Authorization Token
   - Response:
     - The user will be logged out.

5. **Forgot-Password**
   - Request:
     - Method: POST
     - Endpoint: `/user/forgot-password`
     - Body:
       - Email (String)
   - Response:
     - If the user exists in the database, an email for verification will be sent.

6. **Reset-Password**
   - Request:
     - Method: POST
     - Endpoint: `/user/reset-password`
     - Body:
       - OTP (String)
       - Email (String)
       - NewPassword (String)
   - Response:
     - If OTP is correct, the old password will be reset to the new password.

7. **Add-address**
   - Request:
     - Method: POST
     - Endpoint: `/user/add-address`
     - Headers:
       - Authorization Token
     - Body:
       - houseno (String)
       - street (String)
       - city (string)
       - state (string)
       - zipCode (Number)
       - description (string)
   - Response:
     - The address will be added to the user's profile.

**Product Service**

1. **Add-Product**
   - Request:
     - Method: POST
     - Endpoint: `/product/add-product`
     - Headers:
       - Authorization Token (Admin)
     - Body:
       - Product Details (e.g., Name, Description, Price, etc.)
       - Title (String)
       - price (Number)
       - description (string)
       - quantity : (string)
       - adminId : (ObjectId)

   - Response:
     - The product will be added.

2. **Edit-Product**
   - Request:
     - Method: PUT
     - Endpoint: `/product/edit/{productId}`
     - Headers:
       - Authorization Token (Admin)
     - Body:
       - Updated Product Details
   - Response:
     - The product will be updated.

3. **Delete-Product**
   - Request:
     - Method: DELETE
     - Endpoint: `/product/delete/{productId}`
     - Headers:
       - Authorization Token (Admin)
   - Response:
     - The product will be deleted.

4. **Get-Product**
   - Request:
     - Method: GET
     - Endpoint: `/product/get/{productId}`
   - Response:
     - Details of the specified product.

5. **Add-Cart**
   - Request:
     - Method: POST
     - Endpoint: `/product/cart/add`
     - Headers:
       - Authorization Token (User)
     - Body:
       - productId (ObjectId)
   - Response:
     - The product will be added to the user's cart.

6. **Remove-Cart**
   - Request:
     - Method: DELETE
     - Endpoint: `/product/cart/remove/{productId}`
     - Headers:
       - Authorization Token (User)
    - Body:
        - ProductId
   - Response:
     - The product will be removed from the user's cart.

7. **Get-Cart**
   - Request:
     - Method: GET
     - Endpoint: `/product/cart/get`
     - Headers:
       - Authorization Token (User)
   - Response:
     - List of products in the user's cart.

8. **Place-Order**
   - Request:
     - Method: POST
     - Endpoint: `/product/order/place`
     - Headers:
       - Authorization Token (User)
     - Body:
       - address_id (ObjectId)
   - Response:
     - The order will be placed.

9. **Cancel-Order**
   - Request:
     - Method: DELETE
     - Endpoint: `/product/cancel-order`
     - Headers:
       - Authorization Token (User)
     - Body : 
        - order_id (ObjectId)
   - Response:
     - The order will be canceled.

10. **Get-Order**
    - Request:
      - Method: GET
      - Endpoint: `/product/get-order`
    - Response:
      - Details of the specified order.

11. **Add-Review**
    - Request:
      - Method: POST
      - Endpoint: `/product/add-review`
      - Headers:
        - Authorization Token (User)
      - Body:
        - order_id(ObjectId)
        - rating (number)
        - comment (string)
    - Response:
      - The review will be added.

**Mqtt-Chat**

1. **subscribeToReviewerChatMessages**
   - Request:
     - Method: POST
     - Endpoint: `/chat/subscribe/reviewer/{reviewerId}`
     - Headers:
       - Authorization Token (User)
   - Response:
     - The user will subscribe to chat messages from a specific reviewer.

2. **sendChatToReviewer**
   - Request:
     - Method: POST
     - Endpoint: `/chat/reviewer`
     - Headers:
       - Authorization Token (User)
     - Body :
        - message
        - reviewId
    - Response 
        - Chat msg sent to the Reviewer

3. **sendChatToUser**
    - Request:
        - Method : POST
        - EndPoint : `/chat/user/reply
        -Headers : 
            - Authorization Token (User)
        - Body : 
            - message
            - reviewId
            - productId
    -Response: 
        - Chat msg sent to the user
    
4. **GetReviewerChatmsgs** 
    - Request:
      - Method: GET
      - Endpoint: `/product/getmsg`
    - Response:
      - All Messages in the array at the moment

5. **GetAllmsgs**
    - Request:
        - Method: GET
        -EndPoint : `/product/all-msgs/:reviewId`
    - Response:
        - Fetch All the msgs from the db on basis of Topic 