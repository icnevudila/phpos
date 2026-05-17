// No imports needed for this helper

/**
 * Clinical Serializer Service
 * Converts complex clinical database objects into concise, natural-language-like summaries 
 * optimized for AI context windows.
 */
export const ClinicalSerializer = {
  /**
   * Summarizes a patient's dental status
   */
  summarizeTeeth(teeth: any[]): string {
    if (!teeth.length) return "No dental chart records found.";
    
    const findings = teeth.filter(t => t.condition && t.condition !== 'HEALTHY').map(t => {
      return `Tooth ${t.toothNumber}: ${t.condition}${t.isPrimary ? ' (Primary)' : ''}`;
    });

    return findings.length > 0 
      ? `Clinical Findings: ${findings.join(', ')}.`
      : "Overall dental health appears stable with no active caries or conditions noted.";
  },

  /**
   * Summarizes recent appointment history
   */
  summarizeAppointments(appointments: any[]): string {
    if (!appointments.length) return "No appointment history found.";
    
    const recent = appointments.slice(0, 3).map(a => {
      return `${new Date(a.scheduledAt).toLocaleDateString()}: ${a.status} (${a.type})`;
    });

    return `Recent History: ${recent.join(' -> ')}.`;
  },

  /**
   * Summarizes financial/HMO status
   */
  summarizeFinancials(claims: any[]): string {
    const pending = claims.filter(c => c.status === 'SUBMITTED').length;
    const totalAmount = claims.reduce((s, c) => s + Number(c.requestedAmount || 0), 0);
    
    return `Financial Status: ${pending} pending HMO claims. Total historical claim volume: ₱${totalAmount.toLocaleString()}.`;
  },

  /**
   * Creates a master clinical context for the AI
   */
  createFullContext(data: { teeth: any[], appointments: any[], claims: any[] }): string {
    return [
      this.summarizeTeeth(data.teeth),
      this.summarizeAppointments(data.appointments),
      this.summarizeFinancials(data.claims)
    ].join('\n');
  }
};
