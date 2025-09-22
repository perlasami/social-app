import { Router } from 'express';
import { Userservices } from './user.services';
import { validation } from '../middleware/validation.middleware';
import { SignupSchema, confirmemailSchema, resendOtp, loginSchema, forgetPasswordSchema } from './user.validation';
import { auth } from '../middleware/auth.middleware';

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
export default router