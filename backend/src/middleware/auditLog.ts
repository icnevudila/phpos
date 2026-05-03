import { Request, Response, NextFunction } from 'express';

export const auditLogMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  // Orijinal send fonksiyonunu yakala
  const originalSend = res.send;

  res.send = function (body) {
    res.on('finish', async () => {
      // Sadece veriyi değiştiren istekleri logla (POST, PUT, PATCH, DELETE)
      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        try {
          const userId = (req as any).user?.id;
          // const _clinicId = (req as any).user?.clinicId;
          const statusCode = res.statusCode;

          // Not: İleride Prisma şemasına AuditLog tablosunu (GAP-009) eklediğimizde
          // bu yorum satırlarını açarak doğrudan veritabanına yazdıracağız.
          console.info(`[AUDIT LOG] ${req.method} ${req.originalUrl} | User: ${userId || 'GUEST'} | Status: ${statusCode}`);
          
          /*
          if (userId && clinicId) {
            await prisma.auditLog.create({
              data: { userId, clinicId, action: req.method, entity: req.originalUrl, statusCode, ip: req.ip }
            });
          }
          */
        } catch (error) {
          console.error('[AUDIT LOG ERROR]', error);
        }
      }
    });

    return originalSend.call(this, body);
  };

  next();
};