import crypto from 'crypto';

class MetaCapiService {
  private pixelId: string;
  private accessToken: string;
  private apiVersion: string = 'v19.0';
  private isEnabled: boolean;

  constructor() {
    this.pixelId = process.env.META_PIXEL_ID || '';
    this.accessToken = process.env.META_CAPI_TOKEN || '';
    this.isEnabled = Boolean(this.pixelId && this.accessToken);
  }

  private hashData(data: string): string {
    return crypto.createHash('sha256').update(data.trim().toLowerCase()).digest('hex');
  }

  private async sendEvent(events: any[]) {
    if (!this.isEnabled) {
      console.log('Meta CAPI is not enabled (missing pixel ID or token). Skipping event.');
      return;
    }

    const url = `https://graph.facebook.com/${this.apiVersion}/${this.pixelId}/events?access_token=${this.accessToken}`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          data: events,
        }),
      });

      const responseData = await response.json();

      if (!response.ok) {
        console.error('Meta CAPI Error:', responseData);
      } else {
        console.log('Meta CAPI Success:', responseData);
      }
    } catch (error) {
      console.error('Meta CAPI Request Failed:', error);
    }
  }

  public async sendPurchaseEvent(params: {
    eventId: string;
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
    value: number;
    currency: string;
    contentIds?: string[];
    numItems?: number;
    fbp?: string;
    fbc?: string;
    eventSourceUrl?: string;
  }) {
    const userData: any = {
      client_ip_address: params.clientIp,
      client_user_agent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    };

    if (params.email) userData.em = [this.hashData(params.email)];
    if (params.phone) userData.ph = [this.hashData(params.phone)];

    const event = {
      event_name: 'Purchase',
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      user_data: userData,
      custom_data: {
        value: params.value,
        currency: params.currency,
        content_ids: params.contentIds || [],
        content_type: 'product',
        num_items: params.numItems || 1,
      },
      action_source: 'system_generated',
      event_source_url: params.eventSourceUrl,
    };

    await this.sendEvent([event]);
  }

  public async sendAddToCartEvent(params: {
    eventId: string;
    email?: string;
    phone?: string;
    clientIp?: string;
    clientUserAgent?: string;
    value: number;
    currency: string;
    contentIds?: string[];
    fbp?: string;
    fbc?: string;
    eventSourceUrl?: string;
  }) {
    const userData: any = {
      client_ip_address: params.clientIp,
      client_user_agent: params.clientUserAgent,
      fbp: params.fbp,
      fbc: params.fbc,
    };

    if (params.email) userData.em = [this.hashData(params.email)];
    if (params.phone) userData.ph = [this.hashData(params.phone)];

    const event = {
      event_name: 'AddToCart',
      event_time: Math.floor(Date.now() / 1000),
      event_id: params.eventId,
      user_data: userData,
      custom_data: {
        value: params.value,
        currency: params.currency,
        content_ids: params.contentIds || [],
        content_type: 'product',
      },
      action_source: 'website',
      event_source_url: params.eventSourceUrl,
    };

    await this.sendEvent([event]);
  }
}

export const metaCapiService = new MetaCapiService();
