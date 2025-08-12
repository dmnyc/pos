# Customizable Lightning POS

A Bitcoin Lightning Point of Sale application based on Alby's BuzzPay, with added features for merchant customization and tipping.

## Features

- **Merchant Branding**: Customize the POS app with your own logo, colors, and business name
- **Tipping Feature**: Allow customers to add tips as a secondary transaction
- **Self-Hosted**: Deploy on your own server for complete control
- **Bitcoin Lightning Payments**: Fast, low-fee payments via Lightning Network
- **Multiple Currency Support**: Display prices in various fiat currencies or sats
- **Progressive Web App (PWA)**: Install on mobile devices for app-like experience

## Getting Started

### Development

```bash
yarn install
yarn dev
```

### Configuration

1. Navigate to the Settings page to configure your merchant details
2. Set your store name, logo URL, colors, and description
3. Configure tipping options (percentages, custom tips)
4. Save your settings

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on how to deploy this application to your own server.

## Customization Options

### Through the UI

Visit the Settings page (`/#/settings`) to configure:
- Store name and display name
- Logo URL
- Primary and secondary colors
- Store description
- Tip settings (percentages, enable/disable, custom tips)

### Through URL Parameters

You can also configure the merchant branding through URL parameters:
- `?merchant_name=Your%20Store%20Name` - Sets the merchant name
- `?logo_url=https://example.com/logo.png` - Sets the logo URL
- `?primary_color=%23ff5500` - Sets the primary color (hex format with %23 for #)
- `?secondary_color=%23333333` - Sets the secondary color
- `?description=Best%20coffee%20in%20town` - Sets the description
- `?currency=USD` - Sets the default currency

Example: `https://your-domain.com/?merchant_name=Coffee%20Shop&primary_color=%23ff5500&currency=USD`

## Tipping Feature

After a customer completes a payment, they will be presented with the option to add a tip. They can:
1. Select a percentage-based tip (configurable percentages)
2. Enter a custom tip amount (if enabled)
3. Skip tipping and continue

Tips are processed as separate Lightning invoices.

## Lightning Connection

This POS application connects to your Lightning node through a Nostr Wallet Connect (NWC) URL. You'll need:

1. A Lightning wallet that supports NWC (like Alby)
2. The ability to create NWC connections with appropriate permissions (make_invoice, lookup_invoice)

## Creating Multiple Merchant Instances

You can create custom instances for different merchants by:

1. Deploying the app to your server
2. Creating unique URLs with merchant-specific parameters
3. Sharing these URLs with your merchants

Each merchant's settings will be stored in their browser's localStorage.

## Credits

This project is a fork of [Alby's BuzzPay](https://github.com/getAlby/pos), with added features for merchant customization and tipping.

## License

This project maintains the original license from the Alby repository.