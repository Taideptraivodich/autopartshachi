import {
  LeadRepository,
  type CreateLeadInput,
} from "autoparts-db/repositories";

export class LeadService {
  constructor(
    private readonly leadRepo: LeadRepository,
    private readonly telegramToken: string | undefined,
    private readonly telegramChatId: string | undefined,
  ) {}

  async createLead(data: CreateLeadInput): Promise<{ id: number }> {
    // Validate
    if (!data.name?.trim()) throw new Error("Vui lòng nhập họ tên");
    if (!data.phone?.trim()) throw new Error("Vui lòng nhập số điện thoại");
    if (!/^[0-9+\-\s]{8,15}$/.test(data.phone.trim())) {
      throw new Error("Số điện thoại không hợp lệ");
    }

    const id = await this.leadRepo.create(data);

    // Telegram notification — fire-and-forget
    if (this.telegramToken && this.telegramChatId) {
      this.sendTelegram(data).catch(() => {});
    }

    return { id };
  }

  private async sendTelegram(data: CreateLeadInput): Promise<void> {
    const product = data.productName
      ? `\n📦 Sản phẩm: ${data.productName} (${data.productSku ?? ""})`
      : "";
    const text = [
      `🔔 *Lead mới từ Hachi website*`,
      `👤 Tên: ${data.name}`,
      `📞 SĐT: ${data.phone}`,
      product,
      data.message ? `💬 Nội dung: ${data.message}` : "",
    ]
      .filter(Boolean)
      .join("\n");

    await fetch(
      `https://api.telegram.org/bot${this.telegramToken}/sendMessage`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          chat_id: this.telegramChatId,
          text,
          parse_mode: "Markdown",
        }),
      },
    );
  }
}
