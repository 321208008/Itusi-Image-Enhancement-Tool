'use client';

import { useState } from 'react';
import { Upload, Download, ArrowLeftRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useLanguage } from '@/lib/contexts/LanguageContext';
import { translations } from '@/lib/i18n/translations';
import { cn } from '@/lib/utils';
import { useToast } from '@/components/ui/use-toast';

// 风格映射表
const STYLE_MAP: Record<string, string> = {
  'cartoon': 'cartoon',
  'pencil': 'pencil',
  'colorPencil': 'color_pencil',
  'gothic': 'gothic',
  'candy': 'candy',
  'scream': 'scream',
  'wave': 'wave',
  'wonder': 'wonder',
  'lavender': 'lavender'
};

type TranslationCategory = {
  [key: string]: string;
};

export function ImageProcessor() {
  const { t, language } = useLanguage();
  const { toast } = useToast();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [processing, setProcessing] = useState(false);
  const [result, setResult] = useState<string | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [currentEffect, setCurrentEffect] = useState<string | null>(null);

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB 限制

  const validateImage = (file: File): string | null => {
    if (file.size > MAX_FILE_SIZE) {
      return `图片大小不能超过 ${MAX_FILE_SIZE / (1024 * 1024)}MB`;
    }
    
    if (!file.type.startsWith('image/')) {
      return '请选择有效的图片文件';
    }

    return null;
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        toast({
          title: '文件无效',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // 清除之前的处理结果
        setShowComparison(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      const error = validateImage(file);
      if (error) {
        toast({
          title: '文件无效',
          description: error,
          variant: 'destructive',
        });
        return;
      }

      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreview(reader.result as string);
        setResult(null); // 清除之前的处理结果
        setShowComparison(false);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleProcess = async (effect: string, options?: any) => {
    if (!preview) return;

    try {
      setProcessing(true);
      setShowComparison(false);
      setCurrentEffect(effect);
      
      // 从 Base64 数据 URL 中提取实际的 Base64 字符串
      const base64Image = preview.split(',')[1];

      // 处理风格转换的选项
      let processOptions = options;
      if (STYLE_MAP[effect]) {
        processOptions = { style: STYLE_MAP[effect] };
        effect = 'styleTransfer';
      }

      const response = await fetch('/api/image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image: base64Image,
          effect,
          options: processOptions
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '图像处理失败');
      }

      setResult(`data:image/jpeg;base64,${data.image}`);
      setShowComparison(true);
      
      toast({
        title: '处理成功',
        description: '图像处理已完成',
      });
    } catch (error) {
      console.error('处理失败:', error);
      toast({
        title: '处理失败',
        description: error instanceof Error ? error.message : '图像处理失败',
        variant: 'destructive',
      });
    } finally {
      setProcessing(false);
    }
  };

  const handleDownload = (imageUrl: string, type: 'original' | 'processed') => {
    const link = document.createElement('a');
    link.href = imageUrl;
    link.download = `image-${type}-${new Date().getTime()}.jpg`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const renderEffectButtons = (category: 'effects' | 'styles' | 'enhancement') => {
    const categoryTranslations = translations[language][category];
    if (!categoryTranslations) return null;
    
    const entries = Object.entries(categoryTranslations);
    return entries.map(([key, label]: [string, string]) => (
      <Button
        key={key}
        variant="outline"
        className="h-auto py-4"
        disabled={!image || processing}
        onClick={() => handleProcess(key)}
      >
        {processing ? t('processing') : label}
      </Button>
    ));
  };

  const renderImage = (src: string, type: 'original' | 'processed') => (
    <div className="relative group">
      <Badge 
        variant="secondary" 
        className="absolute top-2 left-2 z-10"
      >
        {type === 'original' ? '原图' : '处理后'}
      </Badge>
      <img
        src={src}
        alt={type === 'original' ? "Original" : "Processed"}
        className="max-h-96 w-full object-contain rounded-lg"
      />
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/50 rounded-lg">
        <Button
          variant="secondary"
          size="sm"
          className="absolute bottom-4 right-4"
          onClick={() => handleDownload(src, type)}
        >
          <Download className="w-4 h-4 mr-2" />
          下载
        </Button>
      </div>
    </div>
  );

  const getCurrentEffectName = () => {
    const category = currentEffect && STYLE_MAP[currentEffect] 
      ? 'styles' 
      : (Object.keys(translations[language].effects).includes(currentEffect || '') 
        ? 'effects' 
        : 'enhancement');
    
    const effects = translations[language][category] as Record<string, string>;
    return {
      category: t(`categories.${category}`),
      effect: currentEffect && effects ? effects[currentEffect as keyof typeof effects] || '' : ''
    };
  };

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-4">
      <Card className="p-6">
        {result ? (
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <Badge variant="outline" className="text-sm">
                {getCurrentEffectName().category}：
                {getCurrentEffectName().effect}
              </Badge>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowComparison(!showComparison)}
              >
                <ArrowLeftRight className="w-4 h-4 mr-2" />
                {showComparison ? '隐藏对比' : '显示对比'}
              </Button>
            </div>
            <div className={cn(
              "grid gap-4",
              showComparison ? "grid-cols-2" : "grid-cols-1"
            )}>
              {showComparison && preview && renderImage(preview, 'original')}
              {renderImage(result, 'processed')}
            </div>
          </div>
        ) : (
          <div
            className={cn(
              "border-2 border-dashed rounded-lg p-8 text-center",
              "hover:border-primary transition-colors duration-200",
              "cursor-pointer"
            )}
            onDrop={handleDrop}
            onDragOver={(e) => e.preventDefault()}
          >
            {preview ? (
              renderImage(preview, 'original')
            ) : (
              <div className="flex flex-col items-center space-y-4">
                <Upload className="w-12 h-12 text-muted-foreground" />
                <p className="text-muted-foreground">{t('dropzone')}</p>
                <p className="text-sm text-muted-foreground">
                  {t('formatHint')}
                </p>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                  id="image-upload"
                />
                <Button asChild>
                  <label htmlFor="image-upload">{t('upload')}</label>
                </Button>
              </div>
            )}
          </div>
        )}
      </Card>

      <div className="space-y-6">
        {/* 图像特效功能 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t('categories.effects')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderEffectButtons('effects')}
          </div>
        </div>

        {/* 风格转换功能 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t('categories.styles')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderEffectButtons('styles')}
          </div>
        </div>

        {/* 图像增强功能 */}
        <div className="space-y-2">
          <h2 className="text-lg font-semibold">{t('categories.enhancement')}</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {renderEffectButtons('enhancement')}
          </div>
        </div>
      </div>
    </div>
  );
}