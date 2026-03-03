/**
 * Input validation middleware factory.
 * Returns middleware that validates request body fields.
 */
function validateBody(rules) {
    return (req, res, next) => {
        const errors = [];

        for (const [field, rule] of Object.entries(rules)) {
            const value = req.body[field];

            if (rule.required && (value === undefined || value === null || value === '')) {
                errors.push(`${field} is required`);
                continue;
            }

            if (value !== undefined && rule.maxLength && String(value).length > rule.maxLength) {
                errors.push(`${field} must be at most ${rule.maxLength} characters`);
            }

            if (value !== undefined && rule.oneOf && !rule.oneOf.includes(value)) {
                errors.push(`${field} must be one of: ${rule.oneOf.join(', ')}`);
            }
        }

        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }

        next();
    };
}

module.exports = { validateBody };
