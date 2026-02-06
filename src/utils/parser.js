/**
 * Chaos Parser: Transforma texto bruto en objetos de tarea.
 * Detecta patrones como:
 * - [Urgente] o [Urgent]
 * - (30 min) o (duración h)
 * - #proyecto
 * - !i:10 (impacto)
 * - !e:5 (esfuerzo)
 */
export const parseChaosList = (text) => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);

    return lines.map(line => {
        const raw = line.trim();

        // Valores por defecto
        let task = {
            title: raw,
            impact: 50,
            effort: 50,
            urgency: false,
            duration: null,
            tags: [],
            blocked: false,
            completed: false
        };

        // Título limpio (elimina marcadores del título visible)
        let displayTitle = raw;

        // Detectar Urgencia
        if (raw.toLowerCase().includes('[urgente]') || raw.toLowerCase().includes('urgente') || raw.toLowerCase().includes('[urgent]') || raw.toLowerCase().includes('urgent')) {
            task.urgency = true;
            displayTitle = displayTitle.replace(/\[urgente\]/gi, '')
                .replace(/urgente/gi, '')
                .replace(/\[urgent\]/gi, '')
                .replace(/urgent/gi, '');
        }

        // Detectar Duración (ej: 30m, 1h, 45min)
        const durationMatch = raw.match(/\((\d+)\s*(min|m|h|hour|hora)\)/i);
        if (durationMatch) {
            const value = parseInt(durationMatch[1]);
            const unit = durationMatch[2].toLowerCase();
            task.duration = unit.startsWith('h') ? value * 60 : value;
            displayTitle = displayTitle.replace(durationMatch[0], '');

            // Heurística simple de esfuerzo basado en duración
            task.effort = Math.min(100, (task.duration / 480) * 100);
        }

        // Detectar Tags (#tag)
        const tags = raw.match(/#(\w+)/g);
        if (tags) {
            task.tags = tags.map(t => t.substring(1));
            tags.forEach(t => displayTitle = displayTitle.replace(t, ''));
        }

        // Detectar Impacto/Esfuerzo manual (!i:80 !e:20)
        const impactMatch = raw.match(/!i:(\d+)/i);
        if (impactMatch) task.impact = parseInt(impactMatch[1]);

        const effortMatch = raw.match(/!e:(\d+)/i);
        if (effortMatch) task.effort = parseInt(effortMatch[1]);

        task.title = displayTitle.trim();

        // Heurística de posición aleatoria si no se especifica
        if (!impactMatch) task.impact = 20 + Math.random() * 60;
        if (!effortMatch && !durationMatch) task.effort = 20 + Math.random() * 60;

        return task;
    });
};
