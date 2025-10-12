import { Router } from 'express';
import { Userservices } from './user.services';
import { validation } from '../../middleware/validation.middleware';
import { SignupSchema, confirmemailSchema, resendOtp, loginSchema, forgetPasswordSchema, confirmLoginSchema } from './user.validation';
import { auth } from '../../middleware/auth.middleware';
import { uploadFiles } from '../../utils/multer/multer';
import { uploadMultipleFile } from '../../utils/multer/s3.services';
import { userModel } from '../../models/userModel';
import bcrypt from 'bcrypt';
import { IUser } from '../../models/userModel';
import { HydratedDocument } from 'mongoose';
declare module "express-serve-static-core" {
  interface Request {
    user?: IUser & { _id: string }; 
  }
}
const router = Router()
const user=new Userservices()
router.post('/signup',validation(SignupSchema ), user.signup.bind(user))
router.post('/login',validation(loginSchema ), user.login)
router.patch('/confirm-email',validation(confirmemailSchema ), user.confirmemail)
router.patch('/resend-otp',validation(resendOtp ), user.resendOtp)
router.get('/get-user',auth, user.getUser.bind(user))
router.post('/refresh-token', user.refreshToken)
router.patch('/forget-pass',validation(forgetPasswordSchema ), user.forgetPassword)
router.patch('/reset-pass', user.resetPassword)
router.patch('/profile-image', auth,uploadFiles({}).single('image'),user.profileImage)
router.patch('/cover-image', auth,uploadFiles({}).array("cover-image",5),user.coverImages)
router.post('/2fa/enable', auth(), user.enable2FA);   
router.post('/2fa/verify', auth(), user.verify2FA);   
router.post('/dev/reset-password', async (req, res) => {
  const { email, newPassword } = req.body;
  const saltRounds = parseInt(process.env.SALT || '12', 10);
  const hashed = await bcrypt.hash(newPassword, saltRounds);
  const result = await userModel.updateOne({ email }, { $set: { password: hashed }});
  res.json({ result });
});
router.post('/confirm-login', validation(confirmLoginSchema), user.confirmLogin);
router.patch("/update-basic-info",auth(),user.updateBasicInfo);
router.patch("/update-email", auth(), user.updateEmail);
router.post("/send-email", auth(), user.sendTaggedEmail);

export default router