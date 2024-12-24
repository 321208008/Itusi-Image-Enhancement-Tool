import { NextRequest, NextResponse } from 'next/server';
import { baiduApiService } from '@/lib/services/baidu-api';

// 配置路由为动态路由
export const dynamic = 'force-dynamic';

// 设置超时时间为 60 秒（Vercel hobby 计划的最大限制）
export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    // 添加 CORS 头
    const headers = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    };

    // 处理预检请求
    if (request.method === 'OPTIONS') {
      return new NextResponse(null, { headers });
    }

    const data = await request.json();
    const { image, effect, options } = data;

    if (!image) {
      return NextResponse.json(
        { error: '未提供图片数据' },
        { status: 400, headers }
      );
    }

    let result: string;

    // 图像特效
    switch (effect) {
      case 'colorize':
        result = await baiduApiService.colorize(image);
        break;
      case 'styleTransfer':
        // 确保 style 选项存在且为有效值
        const style = options?.style || 'cartoon';
        const validStyles = [
          'cartoon', 'pencil', 'color_pencil', 'gothic',
          'candy', 'scream', 'wave', 'wonder', 'lavender'
        ];
        if (!validStyles.includes(style)) {
          return NextResponse.json(
            { error: '无效的风格选项' },
            { status: 400, headers }
          );
        }
        result = await baiduApiService.styleTransfer(image, style);
        break;
      case 'anime':
        result = await baiduApiService.selfieAnime(image);
        break;
      // 图像增强
      case 'upscale':
        result = await baiduApiService.imageQualityEnhance(image);
        break;
      case 'dehaze':
        result = await baiduApiService.dehazeImage(image);
        break;
      case 'contrast':
        result = await baiduApiService.contrastEnhance(image);
        break;
      case 'stretch':
        result = await baiduApiService.stretchRestore(image);
        break;
      case 'sharpen':
        result = await baiduApiService.imageDefinitionEnhance(image);
        break;
      case 'colorEnhance':
        result = await baiduApiService.colorEnhance(image);
        break;
      default:
        return NextResponse.json(
          { error: '不支持的效果类型' },
          { status: 400, headers }
        );
    }

    return NextResponse.json({ image: result }, { headers });
  } catch (error) {
    console.error('图像处理错误:', error);
    return NextResponse.json(
      { error: '图像处理失败' },
      { status: 500, headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      } }
    );
  }
} 