# Recent Sales wiring

RecentSalesPanel.jsx has been added safely.

Next wiring step in App.jsx:

1. Add this import near the top:

```js
import RecentSalesPanel from './RecentSalesPanel.jsx';
```

2. Inside the Settings view, place this component after the Status section or after the Price Directory:

```jsx
<RecentSalesPanel onChanged={fetchLiveData} />
```

This avoids hard deleting sales and uses `/api/void-transaction`.
