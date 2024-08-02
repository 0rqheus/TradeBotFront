export default async function createAccs(acc, db) {
  let newAccCounter = 0;

  console.log(acc);

//   let newObject = {
//      account_owner: currentLine[0],
//      origin: currentLine[1],
//      email: currentLine[2].toLowerCase(),
//      password: currentLine[3],
//      gauth: currentLine[4],
//      proxyIp: currentLine[5],
//      proxyPort: currentLine[6],
//      proxyLogin: currentLine[7],
//      proxyPass: currentLine[8],
//   };

  const existingAccsEmails = (await db.getAllAccounts()).map(acc => acc.email.toLowerCase());
  const allProxies = (await db.getAllProxies()).map(proxy => ({
    id: Number(proxy.id),
    host: proxy.host,
    port: proxy.port
  }));
  // accs.shift();
  // for (const acc of accs) {
    const isDuplicateAcc = isDuplicateEmail(existingAccsEmails, acc.email);
    if (!isDuplicateAcc) {
      const accProxy = {
        host: acc.proxyIp,
        port: acc.proxyPort,
        username: acc.proxyLogin,
        password: acc.proxyPass,
      };
      const proxyId = await getProxyId(db, allProxies, accProxy);
      const createdGeneralAccId = await getGeneralAccId(db, acc.email);
      const mullingCredsId = await getMullingCreds(db, acc.account_owner);
      if (proxyId && createdGeneralAccId) {
        const group = getAccGroup(acc.proxyIp, acc.proxyPort);
        const creatingAcc = {
          email: acc.email,
          password: acc.password,
          gauth: acc.gauth,
          proxy_id: proxyId,
          group,
          origin: acc.origin,
          belongs_to: 'trading_console',
          general_account_id: createdGeneralAccId,
          account_owner: mullingCredsId
        }
        const createdAcc = await db.createAccountForExchange(creatingAcc);
        newAccCounter++;
        // if (createdAcc) {
        //   await db['graphqlTradeClient'].mutation({
        //     insert_scheduler_account_info_one: {
        //       __args: {
        //         object: {
        //           account_id: createdAcc.id,
        //           config_id: 24,
        //         }
        //       },
        //       account_id: true,
        //     }
        //   });

        //   await db['graphqlTradeClient'].mutation({
        //     insert_ban_analytics_info_one: {
        //       __args: {
        //         object: {
        //           account_id: createdAcc.id,
        //           ban_analytics_config_id: 9,
        //           remarkable_details: []
        //         }
        //       },
        //       account_id: true,
        //     }
        //   });
        //   newAccCounter++;
        // }
      }
    }
  // }

  console.log(newAccCounter);
}

function isDuplicateEmail(allAccs, email) {
  if (allAccs.includes(email.toLowerCase())) {
    return true;
  }
  return false;
}

async function getProxyId(db, allProxies, accProxy) {
  const existingProxy = await db.getProxiesByHostPort(accProxy.host, accProxy.port);

  if (existingProxy[0]) {
    return existingProxy[0].id;
  }

  const newProxy = await db.createNewProxy(accProxy);
  if (newProxy) {
    return newProxy.id;
  }

  return null;
}

function getAccGroup(host, port) {
  const hostSplitted = host.split('.');
  hostSplitted.pop();
  let fittingPort = port.slice(2).split('');

  for (const digit of fittingPort) {
    if (Number(digit) !== 0) break;
    fittingPort = fittingPort.slice(1);
  }
  const fittingPortString = fittingPort.join('');
  hostSplitted.push(fittingPortString);
  console.log(hostSplitted.join('.'));
  return hostSplitted.join('.');
}

async function getGeneralAccId(db, email) {
  const existingGeneralAcc = await db.getExistingGeneralAcc(email);

  if (existingGeneralAcc[0]) {
    return existingGeneralAcc[0].id;
  }

  const newGeneralAcc = await db.createGeneralAccount(email);
  if (newGeneralAcc) {
    return newGeneralAcc.id;
  }

  return null;
}

async function getMullingCreds(db, account_owner) {
  const existingMullingCreds = await db.getExistingMullingCreds(account_owner);

  if (existingMullingCreds[0]) {
    return existingMullingCreds[0].account_owner;
  }

  const newMullingCreds = await db.createMullingCreds(account_owner);
  if (newMullingCreds) {
    return newMullingCreds.account_owner;
  }

  return null;
}
