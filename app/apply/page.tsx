'use client';

import { useState } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Send, Loader2, Lightbulb, CheckCircle2, Sparkles, ImagePlus, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const OPENAI_API_KEY = process.env.NEXT_PUBLIC_OPENAI_API_KEY!;

// Supabase Clientの初期化
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// Google Chat Webhook URL
const GOOGLE_CHAT_WEBHOOK_URL = process.env.NEXT_PUBLIC_GOOGLE_CHAT_WEBHOOK_URL!;

// Google Chatに通知を送信する関数
async function sendGoogleChatNotification(type: 'idea' | 'consult', formData: Record<string, string | null>) {
  try {
    const now = new Date().toLocaleString('ja-JP', { timeZone: 'Asia/Tokyo' });
    let message = '';

    if (type === 'idea') {
      message = `🆕 *新しいアイデア応募がありました*\n\n` +
        `📅 受信日時: ${now}\n` +
        `👤 お名前: ${formData.name}\n` +
        `📧 メール: ${formData.email}\n` +
        (formData.phone ? `📞 電話番号: ${formData.phone}\n` : '') +
        `📦 商品名: ${formData.productName}\n` +
        `📝 アイデア内容: ${formData.productDescription}\n` +
        (formData.additionalInfo ? `💡 補足情報: ${formData.additionalInfo}\n` : '') +
        (formData.imageUrl ? `🖼️ AI生成画像: あり\n` : '') +
        `\n🔗 管理画面で確認: https://admin-brand-base.vercel.app`;
    } else {
      message = `🆕 *新しい相談がありました*\n\n` +
        `📅 受信日時: ${now}\n` +
        `👤 お名前: ${formData.name}\n` +
        `📧 メール: ${formData.email}\n` +
        (formData.phone ? `📞 電話番号: ${formData.phone}\n` : '') +
        `💬 相談内容: ${formData.inquiry}\n` +
        `\n🔗 管理画面で確認: https://admin-brand-base.vercel.app`;
    }

    await fetch(GOOGLE_CHAT_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text: message }),
    });

    console.log('✅ Google Chat notification sent');
  } catch (error) {
    // 通知の失敗はユーザーに影響させない
    console.error('⚠️ Google Chat notification failed:', error);
  }
}

export default function ApplyPage() {
  const [ideaForm, setIdeaForm] = useState({
    name: '', email: '', phone: '', productName: '', productDescription: '', additionalInfo: '',
  });
  const [consultForm, setConsultForm] = useState({
    name: '', email: '', phone: '', inquiry: '',
  });

  const [isSubmittingIdea, setIsSubmittingIdea] = useState(false);
  const [isSubmittingConsult, setIsSubmittingConsult] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);
  
  const [generatedImagePreview, setGeneratedImagePreview] = useState<string | null>(null);
  const [uploadedImagePath, setUploadedImagePath] = useState<string | null>(null);

  const handleGenerateImage = async () => {
    if (!ideaForm.productName || !ideaForm.productDescription) {
      toast.error('商品名とアイデアの内容を入力してください');
      return;
    }

    setIsGeneratingImage(true);
    setGeneratedImagePreview(null);
    setUploadedImagePath(null);

    try {
      const prompt = `Create a professional product image for: ${ideaForm.productName}. Description: ${ideaForm.productDescription}. Make it look like a realistic product photo with clean white background, studio lighting, high quality commercial photography style.`;

      console.log('🎨 Generating image with DALL-E 3...');

      const response = await fetch('https://api.openai.com/v1/images/generations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'dall-e-3',
          prompt,
          n: 1,
          size: '1024x1024',
          response_format: 'b64_json',
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error?.message || `API error: ${response.status}`);
      }

      if (data.data?.[0]?.b64_json) {
        const base64Data = data.data[0].b64_json;
        const base64WithPrefix = `data:image/png;base64,${base64Data}`;
        
        console.log('✅ Image generated successfully');
        setGeneratedImagePreview(base64WithPrefix);
        
        // base64をBlobに変換してStorageにアップロード
        const blob = await fetch(base64WithPrefix).then(r => r.blob());
        await uploadImageToStorage(blob);
        
        toast.success('画像を生成しました！');
      } else {
        throw new Error('画像データが取得できませんでした');
      }
    } catch (error) {
      console.error('❌ Image generation error:', error);
      toast.error('エラーが発生しました', {
        description: error instanceof Error ? error.message : '画像生成に失敗しました。もう一度お試しください。',
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  const uploadImageToStorage = async (blob: Blob) => {
    try {
      const fileName = `ai-generated/${Date.now()}-${Math.random().toString(36).substring(7)}.png`;
      
      console.log('📤 Uploading to Supabase Storage:', fileName);
      console.log('📦 Blob size:', blob.size, 'bytes');
      console.log('📦 Blob type:', blob.type);

      // Supabase Clientを使用してアップロード
      const { data, error } = await supabase.storage
        .from('product-images')
        .upload(fileName, blob, {
          contentType: 'image/png',
          upsert: false,
        });

      if (error) {
        console.error('❌ Storage upload error:', error);
        toast.error('画像のアップロードに失敗しました', {
          description: error.message || '画像は生成されましたが、保存に失敗しました。応募は可能です。',
        });
        return;
      }

      console.log('✅ Upload successful:', data);
      setUploadedImagePath(data.path);
      console.log('✅ Image path saved:', data.path);

      // 画像のパブリックURLを取得（確認用）
      const { data: publicUrlData } = supabase.storage
        .from('product-images')
        .getPublicUrl(data.path);
      
      console.log('🔗 Public URL:', publicUrlData.publicUrl);

    } catch (error) {
      console.error('❌ Upload exception:', error);
      toast.error('画像のアップロードに失敗しました', {
        description: error instanceof Error ? error.message : 'ネットワークエラーが発生しました',
      });
    }
  };

  const handleIdeaSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingIdea(true);

    try {
      const insertData = {
        type: 'idea' as const,
        name: ideaForm.name,
        email: ideaForm.email,
        phone: ideaForm.phone || null,
        product_name: ideaForm.productName,
        product_description: ideaForm.productDescription,
        additional_info: ideaForm.additionalInfo || null,
        image_url: uploadedImagePath || null,
      };

      console.log('📮 Submitting application...');
      console.log('📋 Insert data:', JSON.stringify(insertData, null, 2));

      const { data, error } = await supabase
        .from('applications')
        .insert(insertData)
        .select();

      if (error) {
        console.error('❌ Database insert error:', error);
        throw new Error(error.message || '送信に失敗しました');
      }

      console.log('✅ Successfully inserted:', data);

      // Google Chatに通知を送信
      await sendGoogleChatNotification('idea', {
        name: ideaForm.name,
        email: ideaForm.email,
        phone: ideaForm.phone || null,
        productName: ideaForm.productName,
        productDescription: ideaForm.productDescription,
        additionalInfo: ideaForm.additionalInfo || null,
        imageUrl: uploadedImagePath || null,
      });

      toast.success('応募を受け付けました！', {
        description: '3営業日以内に担当者よりご連絡いたします。',
      });

      // フォームをリセット
      setIdeaForm({ name: '', email: '', phone: '', productName: '', productDescription: '', additionalInfo: '' });
      setGeneratedImagePreview(null);
      setUploadedImagePath(null);
    } catch (error) {
      console.error('❌ Submit error:', error);
      toast.error('エラーが発生しました', {
        description: error instanceof Error ? error.message : '送信に失敗しました。もう一度お試しください。',
      });
    } finally {
      setIsSubmittingIdea(false);
    }
  };

  const handleConsultSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmittingConsult(true);

    try {
      const { data, error } = await supabase
        .from('applications')
        .insert({
          type: 'consult' as const,
          name: consultForm.name,
          email: consultForm.email,
          phone: consultForm.phone || null,
          inquiry: consultForm.inquiry,
        })
        .select();

      if (error) {
        throw new Error(error.message || '送信に失敗しました');
      }

      // Google Chatに通知を送信
      await sendGoogleChatNotification('consult', {
        name: consultForm.name,
        email: consultForm.email,
        phone: consultForm.phone || null,
        inquiry: consultForm.inquiry,
      });

      toast.success('相談を受け付けました！', {
        description: '2営業日以内に担当者よりご連絡いたします。',
      });
      setConsultForm({ name: '', email: '', phone: '', inquiry: '' });
    } catch (error) {
      toast.error('エラーが発生しました', {
        description: error instanceof Error ? error.message : '送信に失敗しました。もう一度お試しください。',
      });
    } finally {
      setIsSubmittingConsult(false);
    }
  };

  return (
    <div className="bg-gradient-to-b from-white via-gray-50/30 to-white min-h-screen py-20 relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100/20 via-transparent to-transparent pointer-events-none" />
      <motion.div className="absolute top-20 right-1/4 w-96 h-96 bg-gradient-to-br from-blue-100/20 to-transparent rounded-full blur-3xl" animate={{ scale: [1, 1.2, 1], x: [0, 30, 0], y: [0, -20, 0] }} transition={{ duration: 20, repeat: Infinity, ease: 'easeInOut' }} />
      <motion.div className="absolute bottom-20 left-1/4 w-96 h-96 bg-gradient-to-tr from-green-100/20 to-transparent rounded-full blur-3xl" animate={{ scale: [1, 1.3, 1], x: [0, -30, 0], y: [0, 20, 0] }} transition={{ duration: 25, repeat: Infinity, ease: 'easeInOut', delay: 1 }} />

      <div className="container mx-auto px-4 max-w-4xl relative z-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <div className="text-center mb-8">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ duration: 0.5 }}>
              <Badge className="bg-gray-100 text-gray-700 border-gray-200 px-6 py-2 text-sm font-medium mb-6 shadow-sm">Apply Now</Badge>
            </motion.div>
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-5 tracking-tight">簡単応募フォーム</h1>
            <p className="text-lg text-gray-600 text-center mb-12 max-w-2xl mx-auto leading-relaxed">
              まずは気軽にご連絡ください。アイデアの有無に関わらず、あなたのチャレンジを全力でサポートします。
            </p>
          </div>

          {/* 0円カード */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Card className="bg-gradient-to-br from-green-50 via-white to-emerald-50/30 border-green-200 p-8 mb-12 shadow-lg hover:shadow-xl transition-shadow rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-green-200/30 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-emerald-200/20 to-transparent rounded-full blur-3xl group-hover:scale-110 transition-transform duration-700" />
              <div className="relative z-10">
                <div className="flex items-center justify-center gap-3 mb-5">
                  <Sparkles className="w-7 h-7 text-green-700" />
                  <h2 className="text-2xl font-bold text-green-900 text-center">審査を通過すれば、0円で収益化可能</h2>
                </div>
                <div className="grid md:grid-cols-2 gap-8 max-w-3xl mx-auto">
                  <div>
                    <p className="text-green-900 font-bold text-base mb-3">当社が負担する費用</p>
                    <ul className="text-green-800 text-sm space-y-2">
                      {['OEM開発費用', '製造費用', '広告運用費用', 'ページ制作費用', '動画制作費用', '配送費用'].map((item, i) => (
                        <motion.li key={i} className="flex items-center gap-2" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 + 0.3 }}>
                          <CheckCircle2 className="w-4 h-4 text-green-600 flex-shrink-0" />{item}
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                  <div className="flex flex-col justify-center">
                    <div className="bg-gradient-to-br from-green-100 to-emerald-100 border-2 border-green-300 rounded-2xl p-6 shadow-md">
                      <p className="text-green-900 font-bold text-center mb-2 text-lg">あなたの金銭的負担</p>
                      <p className="text-5xl font-bold text-green-900 text-center mb-2">¥0</p>
                      <p className="text-green-800 text-xs text-center mt-3 leading-relaxed">その代わり、商品アイデアは厳正に審査させていただきます</p>
                    </div>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>

          <Tabs defaultValue="consult" className="w-full">
            <TabsList className="grid w-full grid-cols-2 bg-gray-100 border-2 border-gray-200 mb-10 h-14 rounded-2xl p-1">
              <TabsTrigger value="idea" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-xl font-semibold text-base transition-all">アイデアがある方</TabsTrigger>
              <TabsTrigger value="consult" id="call" className="data-[state=active]:bg-gray-900 data-[state=active]:text-white rounded-xl font-semibold text-base transition-all">アイデアがない方</TabsTrigger>
            </TabsList>

            {/* ─── アイデア応募タブ ─── */}
            <TabsContent value="idea">
              <Card className="bg-white border-gray-200 p-8 shadow-lg rounded-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">アイデア応募フォーム</h2>
                <p className="text-gray-600 mb-8 text-base">商品化したいアイデアがある方はこちら。簡単な情報だけでOKです！</p>
                <form className="space-y-6" onSubmit={handleIdeaSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="idea-name" className="text-gray-900 font-semibold">お名前 <span className="text-red-600">*</span></Label>
                      <Input id="idea-name" required className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={ideaForm.name} onChange={(e) => setIdeaForm({ ...ideaForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="idea-email" className="text-gray-900 font-semibold">メールアドレス <span className="text-red-600">*</span></Label>
                      <Input id="idea-email" type="email" required className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={ideaForm.email} onChange={(e) => setIdeaForm({ ...ideaForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="phone" className="text-gray-900 font-semibold">電話番号</Label>
                    <Input id="phone" type="tel" placeholder="折り返しのお電話を希望される場合にご記入ください" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={ideaForm.phone} onChange={(e) => setIdeaForm({ ...ideaForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="productName" className="text-gray-900 font-semibold">商品名/仮称 <span className="text-red-600">*</span></Label>
                    <Input id="productName" required placeholder="例:折りたたみ式スマホスタンド" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={ideaForm.productName} onChange={(e) => setIdeaForm({ ...ideaForm, productName: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="productDescription" className="text-gray-900 font-semibold">アイデアの内容 <span className="text-red-600">*</span></Label>
                    <Textarea id="productDescription" required rows={6} placeholder="どんな商品か、誰に向けたものか、どんな問題を解決するかなど、自由にご記入ください" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 rounded-xl resize-none" value={ideaForm.productDescription} onChange={(e) => setIdeaForm({ ...ideaForm, productDescription: e.target.value })} />
                  </div>

                  {/* AI画像生成 */}
                  <div>
                    <Label className="text-gray-900 font-semibold mb-3 block">AI画像生成（任意）</Label>
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border-2 border-blue-200 rounded-2xl p-6">
                      <div className="flex items-start gap-3 mb-4">
                        <ImagePlus className="w-5 h-5 text-blue-700 mt-0.5 flex-shrink-0" />
                        <div>
                          <p className="text-blue-900 text-sm font-semibold mb-1">AIで商品イメージを生成（DALL-E 3）</p>
                          <p className="text-blue-800 text-xs leading-relaxed">商品名とアイデアの内容を入力すると、AIが商品イメージ画像を生成します。生成した画像は応募と一緒に送信されます。</p>
                        </div>
                      </div>
                      {generatedImagePreview && (
                        <div className="mb-4 rounded-xl overflow-hidden border-2 border-blue-300">
                          <img src={generatedImagePreview} alt="Generated product" className="w-full h-auto" />
                          {uploadedImagePath && (
                            <div className="bg-green-50 border-t-2 border-green-300 p-3">
                              <p className="text-green-800 text-xs font-semibold flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4" />
                                ✅ 画像がアップロード済み
                              </p>
                              <p className="text-green-700 text-xs mt-1 font-mono truncate">
                                {uploadedImagePath}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                      <Button
                        type="button"
                        onClick={handleGenerateImage}
                        disabled={isGeneratingImage || !ideaForm.productName || !ideaForm.productDescription}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-12 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300"
                      >
                        {isGeneratingImage ? (
                          <><Loader2 className="w-5 h-5 mr-2 animate-spin" />画像生成中...（約20〜40秒）</>
                        ) : generatedImagePreview ? (
                          <><RefreshCw className="w-5 h-5 mr-2" />画像を再生成</>
                        ) : (
                          <><Sparkles className="w-5 h-5 mr-2" />AIで画像を生成</>
                        )}
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="additionalInfo" className="text-gray-900 font-semibold">補足情報</Label>
                    <Textarea id="additionalInfo" rows={4} placeholder="参考URL、制作状況、希望時期など、追加で伝えたいことがあればご記入ください" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 rounded-xl resize-none" value={ideaForm.additionalInfo} onChange={(e) => setIdeaForm({ ...ideaForm, additionalInfo: e.target.value })} />
                  </div>

                  <Button type="submit" size="lg" disabled={isSubmittingIdea} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    {isSubmittingIdea ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />送信中...</> : <><Send className="w-5 h-5 mr-2" />応募する</>}
                  </Button>
                  <p className="text-sm text-gray-500 text-center pt-2">※ 応募後、3営業日以内に担当者よりご連絡いたします</p>
                </form>
              </Card>
            </TabsContent>

            {/* ─── 相談タブ ─── */}
            <TabsContent value="consult">
              <Card className="bg-white border-gray-200 p-8 shadow-lg rounded-2xl">
                <h2 className="text-3xl font-bold text-gray-900 mb-3">まずは相談から</h2>
                <p className="text-gray-600 mb-4 text-base">アイデアがなくても大丈夫！当社から商品を割り当てて進めることも可能です。</p>
                <div className="bg-gradient-to-br from-blue-50 to-indigo-50/30 border-2 border-blue-200 rounded-2xl p-6 mb-8 shadow-sm">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Lightbulb className="w-6 h-6 text-blue-700" />
                    </div>
                    <div>
                      <p className="text-blue-900 text-base font-bold mb-2">アイデア割り当てサポート</p>
                      <p className="text-blue-800 text-sm leading-relaxed">商品アイデアをお持ちでない方には、市場調査に基づいた商品案をこちらからご提案。あなたはプロジェクトの運営と意思決定に集中できます。</p>
                    </div>
                  </div>
                </div>
                <form className="space-y-6" onSubmit={handleConsultSubmit}>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <Label htmlFor="consult-name" className="text-gray-900 font-semibold">お名前 <span className="text-red-600">*</span></Label>
                      <Input id="consult-name" required className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={consultForm.name} onChange={(e) => setConsultForm({ ...consultForm, name: e.target.value })} />
                    </div>
                    <div>
                      <Label htmlFor="consult-email" className="text-gray-900 font-semibold">メールアドレス <span className="text-red-600">*</span></Label>
                      <Input id="consult-email" type="email" required className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={consultForm.email} onChange={(e) => setConsultForm({ ...consultForm, email: e.target.value })} />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="consult-phone" className="text-gray-900 font-semibold">電話番号</Label>
                    <Input id="consult-phone" type="tel" placeholder="折り返しのお電話を希望される場合にご記入ください" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 h-12 rounded-xl" value={consultForm.phone} onChange={(e) => setConsultForm({ ...consultForm, phone: e.target.value })} />
                  </div>
                  <div>
                    <Label htmlFor="inquiry" className="text-gray-900 font-semibold">相談内容 <span className="text-red-600">*</span></Label>
                    <Textarea id="inquiry" required rows={8} placeholder="興味のあること、聞いてみたいこと、チャレンジしてみたいことなど、何でもお気軽にご記入ください" className="bg-gray-50 border-gray-300 text-gray-900 mt-2 rounded-xl resize-none" value={consultForm.inquiry} onChange={(e) => setConsultForm({ ...consultForm, inquiry: e.target.value })} />
                  </div>
                  <Button type="submit" size="lg" disabled={isSubmittingConsult} className="w-full bg-gray-900 hover:bg-gray-800 text-white h-14 text-lg font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-[1.02]">
                    {isSubmittingConsult ? <><Loader2 className="w-5 h-5 mr-2 animate-spin" />送信中...</> : <><Send className="w-5 h-5 mr-2" />送信する</>}
                  </Button>
                  <p className="text-sm text-gray-500 text-center pt-2">※ 2営業日以内に担当者よりご連絡いたします</p>
                </form>
              </Card>
            </TabsContent>
          </Tabs>
        </motion.div>
      </div>
    </div>
  );
}