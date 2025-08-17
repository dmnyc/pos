# Sats Factory POS

A Bitcoin Lightning Point of Sale application based on Alby's Lightning POS, with custom themes and tipping features.

## Features

- **Themed Branding**: Choose from a variety of custom themes to style your POS
- **Merchant Customization**: Add your own logo and business name
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
2. Set your store name and logo URL
3. Select a theme for your POS
4. Configure tipping options (percentages, custom tips)
5. Save your settings

### Deployment

See [DEPLOYMENT.md](DEPLOYMENT.md) for detailed instructions on how to deploy this application to your own server.

## Customization Options

### Through the UI

Visit the Settings page (`/#/settings`) to configure:
- Store name and display name
- Logo URL
- Theme selection (standard, orangepill, nostrich, beehive, safari, blocktron, industrial)
- Store description
- Tip settings (percentages, enable/disable, custom tips)

### Through URL Parameters

You can also configure the merchant branding through URL parameters:
- `?merchant_name=Your%20Store%20Name` - Sets the merchant name
- `?logo_url=https://example.com/logo.png` - Sets the logo URL
- `?theme=beehive` - Sets the theme (standard, orangepill, nostrich, liquidity, beehive, safari, blocktron, industrial)
- `?description=Best%20coffee%20in%20town` - Sets the description
- `?currency=USD` - Sets the default currency

Example: `https://your-domain.com/?merchant_name=Coffee%20Shop&theme=orangepill&currency=USD`

## Themes

The POS app includes multiple themes to match different merchant styles:

1. **Standard** - Clean, modern look with green accents
2. **OrangePill** - Bitcoin-inspired orange theme
3. **Nostrich** - Nostr-inspired purple theme
4. **Beehive** - Alby-inspired yellow theme
5. **Liquidity** - A cool blue aquatic theme
6. **Safari** - Desert-inspired warm theme
7. **Blocktron** - Futuristic digital theme
8. **Industrial** - Bold industrial design

Each theme provides a unique visual style while maintaining a consistent layout and functionality.

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

## Application Resilience

This POS application includes several features to prevent and recover from common PWA issues like blank screens, stale caches, or service worker problems:

### Automatic Recovery Mechanisms

1. **Error Boundaries**: Catches JavaScript errors in components to prevent the entire UI from crashing
2. **Version Checking**: Periodically checks for application updates and prompts users to refresh
3. **Service Worker Management**: Improved service worker configuration to handle updates properly
4. **Recovery Button**: A small, unobtrusive button appears after the app loads that allows users to:
   - Clear application caches
   - Unregister service workers
   - Reset localStorage (if needed)
   - Reload with a fresh instance

These resilience features are designed to be authentication-aware, meaning:
- They are fully available on the login/connection screen
- After connecting to a wallet and setting a PIN, recovery mechanisms become more limited to protect against bypassing security
- Error boundaries will never clear user credentials when authenticated

### When to Use Recovery Features

These features are particularly helpful in scenarios like:

- After an application update
- When the screen appears blank or partially loaded
- If components aren't rendering properly
- When the application seems "stuck" or unresponsive

### For Developers

The resilience features work automatically, but developers can:

- Check `public/version.json` to see the currently deployed version
- Update version information in `package.json` to trigger update notifications
- The service worker is configured to check for updates every 5 minutes

Users can also manually check for updates by:
1. Going to Settings → Advanced tab
2. Using the "Check for Updates" feature
3. Clicking "Update Now" if a new version is available (this refreshes the app without clearing data)

These mechanisms help ensure that users always have a working application, even when issues with caching or PWA functionality occur.

## Mobile Optimization

The interface is fully optimized for mobile devices with:

- Responsive layouts that work on all screen sizes
- PWA support for home screen installation
- Touch-friendly buttons and controls
- Compact design that prevents scrolling on small screens

## Credits

This project is a fork of [Alby's Lightning POS](https://github.com/getAlby/pos), with added features for merchant customization and tipping.

## License

This project maintains the original license from the Alby repository.
