import axios from 'axios';

interface BaiduAuthResponse {
  access_token: string;
  expires_in: number;
}

interface BaiduApiResponse {
  log_id?: number;
  image?: string;
  result?: string;
  error_code?: number;
  error_msg?: string;
}

interface BaiduApiConfig {
  apiKey: string;
  secretKey: string;
  accessToken?: string;
  expiresAt?: number;
}

class BaiduApiService {
  private config: BaiduApiConfig;
  private baseUrl = 'https://aip.baidubce.com';

  constructor(apiKey: string, secretKey: string) {
    this.config = {
      apiKey,
      secretKey
    };
  }

  private async ensureAccessToken(): Promise<string> {
    if (
      this.config.accessToken &&
      this.config.expiresAt &&
      this.config.expiresAt > Date.now()
    ) {
      return this.config.accessToken;
    }

    const response = await axios.get<BaiduAuthResponse>(
      'https://aip.baidubce.com/oauth/2.0/token',
      {
        params: {
          grant_type: 'client_credentials',
          client_id: this.config.apiKey,
          client_secret: this.config.secretKey
        }
      }
    );

    this.config.accessToken = response.data.access_token;
    this.config.expiresAt = Date.now() + (response.data.expires_in - 60) * 1000;
    return this.config.accessToken;
  }

  private async makeRequest(endpoint: string, data: Record<string, string>): Promise<string> {
    const accessToken = await this.ensureAccessToken();
    const response = await axios.post<BaiduApiResponse>(
      `${this.baseUrl}${endpoint}`,
      new URLSearchParams(data),
      {
        params: { access_token: accessToken },
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' }
      }
    );

    if (response.data.error_code) {
      throw new Error(response.data.error_msg || '处理失败');
    }

    const resultImage = response.data.image || response.data.result;
    if (!resultImage) {
      throw new Error('处理失败：未返回图像数据');
    }

    return resultImage;
  }

  async colorize(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/colourize', { image });
  }

  async styleTransfer(image: string, option: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/style_trans', { image, option });
  }

  async selfieAnime(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/selfie_anime', { image });
  }

  async imageQualityEnhance(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/image_quality_enhance', { image });
  }

  async dehazeImage(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/dehaze', { image });
  }

  async contrastEnhance(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/contrast_enhance', { image });
  }

  async stretchRestore(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/stretch_restore', { image });
  }

  async imageDefinitionEnhance(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/image_definition_enhance', { image });
  }

  async colorEnhance(image: string): Promise<string> {
    return this.makeRequest('/rest/2.0/image-process/v1/color_enhance', { image });
  }
}

const createBaiduApiService = () => {
  const apiKey = process.env.BAIDU_API_KEY;
  const secretKey = process.env.BAIDU_SECRET_KEY;

  if (!apiKey || !secretKey) {
    throw new Error('百度云 API 密钥未配置');
  }

  return new BaiduApiService(apiKey, secretKey);
};

export const baiduApiService = createBaiduApiService(); 