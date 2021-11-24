const mongoose = require('mongoose');
const AutoIncrement = require('mongoose-sequence')(mongoose);
const uniqueValidator = require('mongoose-unique-validator');
const now = new Date();

const UserSchema = new mongoose.Schema({
    email: {type: String, required:true, unique:true},
    firstName:{type:String, required:true},
    lastName:{type:String, required:true},
    password:{type:String, required:true},
    birthday:{type:Date, required:true},
   })


const User = mongoose.model('User', UserSchema);
UserSchema.plugin(uniqueValidator);
UserSchema.plugin(AutoIncrement, {inc_field: 'id'});

const UserModel={
    create: function(newUser){
        return User.create(newUser)
    },
    findAll:function(){
        return User.find()
    },

    findByEmail:function(email){

        return User.findOne({email:email})
    },

    update: function(Id,newUser){
        return User.updateOne({id:Id},newUser)
    },

    delete: function(Id){
        return User.deleteOne({id:Id})
    },


}

const validateUser={
    email:function(String){
        if(/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(String)){
            return true;
        }
        else{
            return false;
        }
    },

    firstName: function(String){
        if(String.length >0){
            return true;
        }
        else{
            return false;
        }
    },

    lastName: function(String){
        if(String.length >0){
            return true;
        }
        else{
            return false;
        }
    },

    password: function(String){
        if(String.length >0){
            return true;
        }
        else{
            return false;
        }
    },
    //check if birthday is in the past

    birthday: function(date){
        if(Date.parse(date) !=NaN && Date.parse(date) < now){
            return true;
        }
        else{
            return false;
        }
    },

}

module.exports = {UserModel, validateUser}