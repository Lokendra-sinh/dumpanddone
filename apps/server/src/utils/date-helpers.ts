export function serializeDate(date: Date): string {
    return date.toISOString();
  }
  
  export function deserializeDate(dateString: string): Date {
    return new Date(dateString);
  }