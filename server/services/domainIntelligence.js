function calculateDomainAgeRisk(creationDate) {
  if (!creationDate) {
    return {
      score: 0,
      signal: null,
      ageDays: null,
    };
  }

  const created = new Date(creationDate);

  if (Number.isNaN(created.getTime())) {
    return {
      score: 0,
      signal: null,
      ageDays: null,
    };
  }

  const now = new Date();

  const ageDays = Math.floor(
    (now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (ageDays < 30) {
    return {
      score: 25,
      ageDays,
      signal: "Domain was registered less than 30 days ago",
    };
  }

  if (ageDays < 180) {
    return {
      score: 15,
      ageDays,
      signal: "Domain is relatively new",
    };
  }

  if (ageDays < 365) {
    return {
      score: 5,
      ageDays,
      signal: "Domain is less than one year old",
    };
  }

  return {
    score: 0,
    ageDays,
    signal: null,
  };
}

async function fetchRdapDomainData(domain) {
  try {
    const response = await fetch(`https://rdap.org/domain/${domain}`);

    if (!response.ok) {
      return {
        success: false,
        error: `RDAP lookup failed with status ${response.status}`,
      };
    }

    const data = await response.json();

    const registrationEvent = data.events?.find(
      (event) =>
        event.eventAction === "registration" ||
        event.eventAction === "registered"
    );

    const creationDate = registrationEvent?.eventDate || null;

    const registrarEntity = data.entities?.find((entity) =>
      entity.roles?.includes("registrar")
    );

    let registrar = null;

    if (registrarEntity?.vcardArray?.[1]) {
      const fnEntry = registrarEntity.vcardArray[1].find(
        (entry) => entry[0] === "fn"
      );

      registrar = fnEntry?.[3] || null;
    }

    const ageRisk = calculateDomainAgeRisk(creationDate);

    return {
      success: true,

      domain: data.ldhName || domain,

      creationDate,

      registrar,

      ageDays: ageRisk.ageDays,

      ageRiskScore: ageRisk.score,

      ageSignal: ageRisk.signal,

      status: data.status || [],
    };
  } catch (error) {
    console.error("RDAP lookup error:", error.message);

    return {
      success: false,
      error: "Unable to retrieve domain registration information",
    };
  }
}

module.exports = {
  calculateDomainAgeRisk,
  fetchRdapDomainData,
};