export function getFollowUpDays(severity) {
    switch (severity) {
      case "critical": return 3;
      case "moderate": return 7;
      default: return 14;
    }
  }
  