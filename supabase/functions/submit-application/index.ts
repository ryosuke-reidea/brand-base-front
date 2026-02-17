import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    const requestData = await req.json()
    
    // ★ デバッグログ：受信したデータ全体を出力
    console.log('═══════════════════════════════════════')
    console.log('📥 Received request data:')
    console.log(JSON.stringify(requestData, null, 2))
    console.log('═══════════════════════════════════════')

    const { type, name, email, phone } = requestData

    if (type === 'idea') {
      const { 
        productName, 
        productDescription, 
        additionalInfo, 
        aiImagePath  // ← これを受け取る
      } = requestData

      // ★ デバッグログ：aiImagePathの値を確認
      console.log('🖼️ AI Image Path received:', aiImagePath)
      console.log('🖼️ AI Image Path type:', typeof aiImagePath)
      console.log('🖼️ AI Image Path is null?', aiImagePath === null)
      console.log('🖼️ AI Image Path is undefined?', aiImagePath === undefined)

      // データベースに挿入するオブジェクト
      const insertData = {
        type: 'idea',
        name,
        email,
        phone: phone || null,
        product_name: productName,
        product_description: productDescription,
        additional_info: additionalInfo || null,
        image_url: aiImagePath || null,
        created_at: new Date().toISOString(),
      }

      // ★ デバッグログ：挿入するデータを確認
      console.log('💾 Data to insert:')
      console.log(JSON.stringify(insertData, null, 2))

      const { data, error } = await supabaseClient
        .from('applications')
        .insert(insertData)
        .select()

      if (error) {
        console.error('❌ Database insert error:', error)
        throw error
      }

      console.log('✅ Successfully inserted:', data)

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )

    } else if (type === 'consult') {
      const { inquiry } = requestData

      const { data, error } = await supabaseClient
        .from('applications')
        .insert({
          type: 'consult',
          name,
          email,
          phone: phone || null,
          inquiry,
          created_at: new Date().toISOString(),
        })
        .select()

      if (error) {
        console.error('❌ Database insert error:', error)
        throw error
      }

      console.log('✅ Successfully inserted:', data)

      return new Response(
        JSON.stringify({ success: true, data }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        },
      )
    } else {
      throw new Error('Invalid type specified')
    }

  } catch (error) {
    console.error('❌ Error:', error)
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error.message || 'An error occurred' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})