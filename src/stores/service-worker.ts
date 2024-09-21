self.addEventListener("push", (event: PushEvent) => {
  if (event.data) {
    const data = event.data.json() as {
      title: string;
      body: string;
      icon: string;
    };

    self.registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon,
    });
  } else {
    console.log("Push event but no data");
  }
});
