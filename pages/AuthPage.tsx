
import React, { useState } from 'react';
import { User } from '../types';
import { Shirt, ShieldCheck, Smartphone, Lock, ArrowRight, AlertCircle } from 'lucide-react';
import { verifyPassword } from '../lib/password';

interface Props {
  allUsers: User[];
  onLogin: (user: User) => void;
  onRegister: (user: User) => void;
}

const AuthPage: React.FC<Props> = ({ allUsers, onLogin, onRegister }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!phone || !password) {
        setErrorMsg("请完整填写手机号和密码");
        return;
    }

    if (isLogin) {
      const foundUser = allUsers.find(u => u.phone === phone);
      if (!foundUser) {
        setErrorMsg("该手机号尚未注册");
        return;
      }
      // 使用 bcrypt 验证密码
      const isPasswordValid = await verifyPassword(password, foundUser.password);
      if (!isPasswordValid) {
        setErrorMsg("密码不正确，请重新输入");
        return;
      }
      onLogin(foundUser);
    } else {
      if (phone.length !== 11) {
        setErrorMsg("请输入11位有效的手机号");
        return;
      }
      if (allUsers.some(u => u.phone === phone)) {
        setErrorMsg("该手机号已注册，请直接登录");
        return;
      }

      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        phone,
        password,
        quota: 5,
        role: phone === '13336831110' ? 'ADMIN' : 'USER'
      };

      onRegister(newUser);
      alert("注册成功！即将为您自动登录。");
      onLogin(newUser);
    }
  };

  return (
    <div className="min-h-screen flex flex-col md:flex-row">
      {/* Visual Side */}
      <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-rose-100 via-rose-50 to-white items-center justify-center p-12 overflow-hidden relative">
         <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-pink-200/20 blur-[120px] rounded-full" />
         <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-blue-200/20 blur-[120px] rounded-full" />
         
         <div className="relative z-10 max-w-lg text-center">
            <div className="w-20 h-20 bg-rose-500 rounded-[2.5rem] mx-auto mb-8 flex items-center justify-center shadow-2xl shadow-rose-200">
               <Shirt className="text-white" size={40} />
            </div>
            <h1 className="text-5xl font-black text-gray-800 mb-6 leading-tight">
              开启您的 <br/><span className="text-rose-500">AI 童装视觉</span>时代
            </h1>
            <p className="text-lg text-gray-400 mb-12">上传衣服，一键生成专业模特大片。为电商卖家打造的 AI 摄影工坊。</p>
            
            <div className="grid grid-cols-2 gap-4">
               <div className="bg-white/50 backdrop-blur p-4 rounded-3xl border border-white">
                  <p className="text-2xl font-black text-gray-800">10s</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">平均生成速度</p>
               </div>
               <div className="bg-white/50 backdrop-blur p-4 rounded-3xl border border-white">
                  <p className="text-2xl font-black text-gray-800">4K</p>
                  <p className="text-xs text-gray-400 font-bold uppercase">超高清输出</p>
               </div>
            </div>
         </div>
      </div>

      {/* Form Side */}
      <div className="flex-1 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-sm space-y-8">
           <div className="text-center md:hidden mb-12">
             <div className="w-12 h-12 bg-rose-500 rounded-2xl mx-auto mb-4 flex items-center justify-center">
               <Shirt className="text-white" size={24} />
             </div>
             <h2 className="text-2xl font-black text-gray-800">KidStyle AI</h2>
           </div>

           <div>
              <h2 className="text-3xl font-black text-gray-800 mb-2">{isLogin ? '欢迎回来' : '开启体验'}</h2>
              <p className="text-gray-400 font-medium">{isLogin ? '请输入您的手机号和密码登录' : '完成注册即可获得 5 个初始配额'}</p>
           </div>

           <form onSubmit={handleSubmit} className="space-y-4">
              {errorMsg && (
                <div className="bg-rose-50 border border-rose-100 p-3 rounded-xl flex items-center space-x-2 text-rose-500 text-xs font-bold animate-in fade-in slide-in-from-top-1">
                   <AlertCircle size={16} />
                   <span>{errorMsg}</span>
                </div>
              )}

              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400 uppercase ml-1">手机号</label>
                 <div className="relative">
                    <Smartphone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="tel" 
                      placeholder="请输入11位手机号" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-medium text-black"
                      value={phone}
                      onChange={e => {setPhone(e.target.value); setErrorMsg('');}}
                    />
                 </div>
              </div>
              <div className="space-y-1">
                 <label className="text-xs font-bold text-gray-400 uppercase ml-1">密码</label>
                 <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                      type="password" 
                      placeholder="请输入登录密码" 
                      className="w-full pl-12 pr-4 py-4 bg-gray-50 border-2 border-transparent focus:border-rose-400 rounded-2xl outline-none transition-all font-medium text-black"
                      value={password}
                      onChange={e => {setPassword(e.target.value); setErrorMsg('');}}
                    />
                 </div>
              </div>
              
              <div className="flex items-center justify-between text-xs font-bold px-1">
                 <div className="flex items-center space-x-2 text-gray-400">
                    <input type="checkbox" className="w-4 h-4 rounded text-rose-500 focus:ring-rose-400" />
                    <span>记住我</span>
                 </div>
                 <button type="button" className="text-rose-500 hover:text-rose-600 transition-colors">忘记密码？</button>
              </div>

              <button 
                type="submit"
                className="w-full py-4 bg-rose-500 text-white rounded-2xl font-black text-lg shadow-xl shadow-rose-200 hover:scale-[1.02] transition-transform active:scale-95 flex items-center justify-center space-x-2"
              >
                <span>{isLogin ? '立即登录' : '提交注册'}</span>
                <ArrowRight size={20} />
              </button>
           </form>

           <p className="text-center text-sm font-medium text-gray-400 mt-6">
              {isLogin ? '还没有账号？' : '已经有账号了？'}
              <button 
                onClick={() => {setIsLogin(!isLogin); setErrorMsg('');}}
                className="text-rose-500 font-bold ml-1 hover:underline"
              >
                {isLogin ? '立即注册' : '立即登录'}
              </button>
           </p>
           
           <div className="mt-12 text-center">
              <p className="text-[10px] text-gray-300 font-bold uppercase tracking-widest flex items-center justify-center space-x-2">
                 <ShieldCheck size={12} />
                 <span>隐私安全保障 · 加密算法存储</span>
              </p>
           </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
