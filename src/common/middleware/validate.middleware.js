import ApiError from "../utils/api-error"


const validate = (DtoClass)=>{
   return (req,res,next)=>{
    const {errors,value}=DtoClass.validate(req.body)
    if(errors){
        throw ApiError.badRequest(errors.join("; "))
    }
   }
}

export default validate