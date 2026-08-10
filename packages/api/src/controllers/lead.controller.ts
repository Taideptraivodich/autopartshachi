import { type Request, type Response } from "express";
import { LeadService } from "../services/lead.service.js";

export class LeadController {
  constructor(private readonly leadService: LeadService) {}

  create = async (req: Request, res: Response): Promise<void> => {
    try {
      const { name, phone, message, productName, productSku, source } =
        req.body as {
          name?: string;
          phone?: string;
          message?: string;
          productName?: string;
          productSku?: string;
          source?: string;
        };
      const result = await this.leadService.createLead({
        name: name ?? "",
        phone: phone ?? "",
        message,
        productName,
        productSku,
        source,
      });
      res.status(201).json({ data: result });
    } catch (err) {
      res
        .status(400)
        .json({ error: err instanceof Error ? err.message : "Lỗi gửi liên hệ" });
    }
  };
}
