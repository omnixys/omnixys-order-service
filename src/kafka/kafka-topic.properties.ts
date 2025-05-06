/**
 * Zentrale Konfiguration aller Kafka-Topics im System.
 * Dient der Typsicherheit, Übersichtlichkeit und Wiederverwendbarkeit in Publishern und Handlern.
 */

export const KafkaTopics = {
    ShoppingCart: {
        CustomerCreated: 'shopping-cart.customer.created',
        CustomerDeleted: 'shopping-cart.customer.deleted',
        // DeletedSuccess: 'shopping-cart.deleted.success',
    },
    Notification: {
        SendMailCreate: 'notification.send.create.mail',
        SendMailUpdate: 'notification.send.update.mail',
        SendMailDelete: 'notification.send.delete.mail',
    },
    system: {
        shutdownAll: 'system.shutdown',
    },
    activity: {
        log: 'activity.shopping-cart.log',
    }
    // Weitere Domains und Topics hier ergänzen
} as const;

/**
 * Type-safe Zugriff auf Topic-Namen.
 * Beispiel: `KafkaTopics.ShoppingCart.CustomerDeleted`
 */
export type KafkaTopicsType = typeof KafkaTopics;

/**
 * Hilfsfunktion zur Auflistung aller konfigurierten Topic-Namen (z. B. für Subscriptions).
 */
export function getAllKafkaTopics(): string[] {
    const flatten = (obj: any): string[] =>
        Object.values(obj).flatMap((value) =>
            typeof value === 'string' ? [value] : flatten(value)
        );
    return flatten(KafkaTopics);
}

/**
 * Gibt alle Kafka-Topics zurück, optional gefiltert nach Top-Level-Kategorien.
 * @param keys z.B. ['ShoppingCart', 'Notification']
 */
export function getKafkaTopicsBy(keys: string[]): string[] {
    const result: string[] = [];
    for (const key of keys) {
        const section = (KafkaTopics as Record<string, any>)[key];
        if (section && typeof section === 'object') {
            for (const topic of Object.values(section)) {
                if (typeof topic === 'string') {
                    result.push(topic);
                }
            }
        }
    }
    return result;
}
