async function checkUrlReputation(url) {
  const apiKey = process.env.VIRUSTOTAL_API_KEY;

  if (!apiKey) {
    return {
      success: false,
      error: "VirusTotal API key is not configured",
    };
  }

  try {
    // Step 1: Submit URL for analysis
    const formData = new URLSearchParams();
    formData.append("url", url);

    const submitResponse = await fetch(
      "https://www.virustotal.com/api/v3/urls",
      {
        method: "POST",
        headers: {
          "x-apikey": apiKey,
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      }
    );

    if (!submitResponse.ok) {
      return {
        success: false,
        error: `VirusTotal submission failed: ${submitResponse.status}`,
      };
    }

    const submitData = await submitResponse.json();

    const analysisId = submitData.data?.id;

    if (!analysisId) {
      return {
        success: false,
        error: "VirusTotal did not return an analysis ID",
      };
    }

    // Small wait for analysis
    await new Promise((resolve) => setTimeout(resolve, 2500));

    // Step 2: Retrieve analysis result
    const analysisResponse = await fetch(
      `https://www.virustotal.com/api/v3/analyses/${analysisId}`,
      {
        headers: {
          "x-apikey": apiKey,
        },
      }
    );

    if (!analysisResponse.ok) {
      return {
        success: false,
        error: `VirusTotal result lookup failed: ${analysisResponse.status}`,
      };
    }

    const analysisData = await analysisResponse.json();

    const stats =
      analysisData.data?.attributes?.stats || {};

    const malicious = stats.malicious || 0;
    const suspicious = stats.suspicious || 0;
    const harmless = stats.harmless || 0;
    const undetected = stats.undetected || 0;

    let reputationRiskScore = 0;
    let reputationSignal = null;

    if (malicious >= 3) {
      reputationRiskScore = 35;
      reputationSignal =
        `${malicious} security engines flagged this URL as malicious`;
    } else if (malicious >= 1) {
      reputationRiskScore = 25;
      reputationSignal =
        `${malicious} security engine(s) flagged this URL as malicious`;
    } else if (suspicious >= 1) {
      reputationRiskScore = 15;
      reputationSignal =
        `${suspicious} security engine(s) marked this URL as suspicious`;
    }

    return {
      success: true,
      malicious,
      suspicious,
      harmless,
      undetected,
      reputationRiskScore,
      reputationSignal,
    };
  } catch (error) {
    console.error(
      "VirusTotal reputation error:",
      error.message
    );

    return {
      success: false,
      error: "Unable to retrieve external threat reputation",
    };
  }
}

module.exports = {
  checkUrlReputation,
};