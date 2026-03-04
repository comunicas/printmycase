ALTER TYPE order_status ADD VALUE 'analyzing' AFTER 'paid';
ALTER TYPE order_status ADD VALUE 'customizing' AFTER 'analyzing';
ALTER TYPE order_status ADD VALUE 'producing' AFTER 'customizing';